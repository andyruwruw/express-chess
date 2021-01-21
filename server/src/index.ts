import * as express from 'express';

const app = express();
app.set('port', process.env.PORT || 3000);

let http = require('http').Server(app);
let io = require('socket.io')(http);

io.on('connection', function(socket: any) {
  console.log(socket);

  
  socket.on('message', function(message: any) {
    console.log(message);
  })
});

const server = http.listen(3000, function() {
  console.log('Listening on *:3000');
});
