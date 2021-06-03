import moment from 'moment'
let socket = io();
const virusEl = document.querySelector('#virus');

let newListItem1;
let newListItem2;

const handleVirusClick = () => {
    socket.emit('clicked');
    virusEl.removeEventListener('click', handleVirusClick);
}

document.querySelector('#joinForm').addEventListener('submit', e => {
    e.preventDefault();

    document.querySelector('#loading').classList.remove('hide')

    const username = document.querySelector('#username').value

    const timeJoined = moment().format

    socket.emit('newPlayer', username)
    
});

document.querySelector('#player1 button').addEventListener('click', () => {
    document.querySelector('#player1 button').innerHTML = 'Start!'
    socket.emit("ready")
})

socket.on('newGame', (players) => {
    const player1 = players[socket.id]
    delete players[socket.id]
    const player2 = Object.values(players)

    document.querySelector('#player1 h1').innerHTML = player1
    document.querySelector('#player2 h1').innerHTML = player2
    document.querySelector('#register-player').classList.add('hide')
    document.querySelector('#game').classList.remove('hide')
})


socket.on('startGame', (delay, position1, position2) => {

    document.querySelector('#player1 button').classList.add('hide');

    virusEl.style.gridColumn = position1;
    virusEl.style.gridRow = position2;

    setTimeout(() => {
        virusEl.classList.remove('hide');

        const startTime = new Date().getTime();

        const ul1 = document.querySelector('#timer1');
        const li1 = document.createElement('LI');
        newListItem1 = ul1.appendChild(li1);

        const ul2 = document.querySelector('#timer2');
        const li2 = document.createElement('LI');
        newListItem2 = ul2.appendChild(li2);

        timer1 = setInterval(() => {
            let diff = moment(new Date().getTime()).diff(moment(startTime));
            
            newListItem1.innerHTML = moment(diff).format('mm:ss:SSS');
        }, 1) 

        timer2 = setInterval(() => {
            let diff = moment(new Date().getTime()).diff(moment(startTime));
            
            newListItem2.innerHTML = moment(diff).format('mm:ss:SSS');
        }, 1) 

        virusEl.addEventListener('click', handleVirusClick)
        
    }, delay)
})


socket.on('getScore', id => {
    let player = null;

    id === socket.id
        ? player = 'player2'
        : player = 'player1'
    
    let oldScore = Number(document.querySelector(`#${player}Score`).innerHTML);
    let newScore = ++oldScore;
    document.querySelector(`#${player}Score`).innerHTML = newScore;
    virusEl.classList.add('hide')
})


socket.on('stopTimer', (id) => {
    id === socket.id
        ? clearInterval(timer1)
        : clearInterval(timer2)
})

socket.on('setWinner', () => {
    if(document.querySelector('#player1Score').innerHTML > document.querySelector('#player2Score').innerHTML) {
        document.querySelector('#setWinner').innerHTML = 'congratulations You win!'
    } else if (document.querySelector('#player1Score').innerHTML < document.querySelector('#player2Score').innerHTML) {
        document.querySelector('#setWinner').innerHTML = 'You lose Better luck next time...'
    } else {
        document.querySelector('#setWinner').innerHTML = 'It\'s a tie!'
    }

})