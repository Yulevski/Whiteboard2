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

io.sockets.on('connection', function (socket) {
  var room = '';
  var name = '';
  var img = './image/icon.jpg';

  socket.on('client_to_server_join', function (data) {
      room = data.room;
      name = data.name;
      socket.join(room);
      io.to(room).emit('server_to_client_join', { join: name + "さんが入室しました。" });
  });

  socket.on('client_to_sever_upload', function (data) {
      img = data.img;
  });

  socket.on('client_to_server', function (data) {
      socket.broadcast.to(room).emit('server_to_client', { otherMsg: data.message, name: name, img: img });
  });

  socket.on('disconnect', function () {
      if (name == '') {
          console.log("未入室のまま、どこかへ去っていきました。");
      } else {
          io.to(room).emit('server_to_client_join', { join: name + "さんが退室しました。" });
      }
  });
});