/**
 * Socket Controller
 */

 const debug = require('debug')('kill-the-virus:socket_controller');

 let players = {}
 let availableRoom = 1
 let games = []
 
 // [
 //     {
 //         room: 'game-1',
 //         players: { 
 //             k_TbtAwC6mVUJPWPAAAD: 'Jasmine', 
 //             jt53kJF62zgb1CU7AAAC: 'Johan' 
 //         },
 //         ready: 0,
 //         rounds: 0,
 //     }
 // ]
 
 let io = null;
 
 const setVirusCoords = () => {
     return Math.floor(Math.random() * 20) + 1
 }
 
 const generateDelay = () => {
     return Math.floor(Math.random() * (5000 - 1000)) + 1000
 }
 
 
 const handlePlayerJoin = function(username) {
     players[this.id] = username;
 
     this.join('game-' + availableRoom);
     
     if(Object.keys(players).length === 2) {
         const room = 'game-' + availableRoom
 
         let game = {
             room,
             players,
             ready: 0,
             rounds: 0,
             clicks: [],
         }
 
         games.push(game)
 
         io.to(room).emit('starGame', players);
         
         // empty players
         players = {}
         
         // increase the availableRoom number
         availableRoom++
     }
 };

 
 const handlePlayerIsReady = function() {
     const game = games.find(id => id.players[this.id]);
     game.ready++
 
     if(game.ready === 2) {
         // start the game
         io.to(game.room).emit('startGame', generateDelay(), setVirusCoords(), setVirusCoords())
     }
 }
 
 const handleClicked = function() {
     const game = games.find(id => id.players[this.id]);
 
     // Stop timer
     io.to(game.room).emit('stopTimer', this.id)
 
     game.clicks.push(this.id)
 
     if(game.clicks.length === 2) {
         io.to(game.room).emit('getScore', this.id)
 
         game.clicks = []
 
         game.rounds++
 
         if(game.rounds < 10) {
             delay = generateDelay();
             io.to(game.room).emit('startGame', delay, setVirusCoords(), setVirusCoords());
         } else if (game.rounds === 10) {
             io.to(game.room).emit('setWinner')
         }
     }
 }
 
 const handleDisconnect = function() {
     delete players[this.id]
 };
 
 module.exports = function(socket) {
     io = this;
     
     debug(`Client ${socket.id} connected!`);
 
     socket.on('newPlayer', handlePlayerJoin);
    
     socket.on('disconnect', handleDisconnect);
 
     socket.on('ready', handlePlayerIsReady);
 
     socket.on('clicked', handleClicked);
 }