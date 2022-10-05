const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;//http://localhost:3000/

app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

}


io.on('connection', onConnection);
// io.on('connection', (socket) => {
 
//   socket.on('chat message', (msg) => {
//     io.emit('chat message', msg);
//     console.log("send");
//   });
//   });
  
http.listen(port, () => console.log('listening on port ' + port));