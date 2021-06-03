/**
 * Socket Controller
 */

 const debug = require('debug')('kill-the-virus:socket_controller');

 let players = {}
 let availableRoom = 1
 let games = []
 
 let io = null;
 
 const setVirusCoords = () => {
     return Math.floor(Math.random() * 20) + 1
 }
 
 const generateDelay = () => {
     return Math.floor(Math.random() * (5000 - 1000)) + 1000
 }
 
 const handlePlayerJoin = function(username, time) {
     players[this.id] = username;
     players.time = time
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
         io.to(room).emit('newGame', players);
         players = {}
         availableRoom++
     }
 };

 
 const handlePlayerIsReady = function() {
     const game = games.find(id => id.players[this.id]);
     game.ready++
     if(game.ready % 2 === true) {
         io.to(game.room).emit('startGame', generateDelay(), setVirusCoords(), setVirusCoords())
     }
 }
 
 const handleClicked = function() {
     const game = games.find(id => id.players[this.id]);
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