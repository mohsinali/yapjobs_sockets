var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var $ = require('jquery');
var clients = [];
var user_id = "";

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get("/connect", function(req, res){
  console.log(req);
});

// ############################################################
// Broadcast chat / message
app.get("/update_unread_msgs_counter", function(req, res){
  // if (io.sockets.connected[socket.id]) {
  //   io.sockets.connected[socket.id].emit('unread_msgs_total', 'for your eyes only');
  // }
  // console.log("Update");
  // io.emit('unread_msgs_total', "560");
  // res.sendFile(__dirname + '/update_unread_msgs_counter.html');
    
  clients.forEach(function(value){
    console.log("Client in action: " + value);
    if(value.user_id === req.query.user_id){
      res_obj = { count: req.query.count, msg: req.query.msg, job_seeker_id: req.query.job_seeker_id}
      s = io.sockets.connected[value.socket_id]
      if(s === undefined){
        console.log("Undefined socket: ");
      }else{
        io.sockets.connected[value.socket_id].emit('private', res_obj);
        console.log("Message emitted to socket: " + value.socket_id);
      }
    }
  });

  // io.emit('private', req.query.count);
  // io.sockets.connected[socket_id].emit('private', req.query.count);
  res.send('Request complete');
});

// ############################################################
// Broadcast job application message
app.get("/job_application_message", function(req, res){
  console.log("m inside");
  clients.forEach(function(value){
    
    if(value.user_id === req.query.user_id){
      res_obj = { msg: req.query.msg }
      s = io.sockets.connected[value.socket_id]
      if(s === undefined){
        console.log("Undefined socket: ");
      }else{
        io.sockets.connected[value.socket_id].emit('listen_job_application', res_obj);
        console.log("Message emitted to socket: " + value.socket_id);
      }
    }
  });
  
  res.send('Request complete');
});
// ############################################################

app.get('/counter', function(req, res){
  res.sendFile(__dirname + '/counter.html');
});

app.get('/counter1', function(req, res){
  io.emit('counter', "msg");
});



io.on('connection', function(socket){
  console.log(socket.handshake.query);
  user_id = socket.handshake.query.user_id;
  
  clients.push({user_id: user_id, socket_id: socket.id});

  clients.forEach(function(value){
    if(value.user_id === undefined){
      clients.pop(value);
    }
  });
  console.log(clients);

  // $.each(clients, function(index, value){
  //   if(value.user_id == 'undefined'){
  //     console.log(value);
  //   }
  // });


  socket.on('disconnect', function(){
    console.log('Disconnecting Socket ' + Date());
    console.log(socket.id);
    clients.pop(socket.id);   
    console.log(clients); 
  });  

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    console.log(clients);
    io.emit('chat message', msg);
    
    if (io.sockets.connected[socket.id]) {
      io.sockets.connected[socket.id].emit('private', 'for your eyes only');
    }
  });

  socket.on('typing', function(msg){
    console.log("Someone is typing.")
    io.emit('typing', msg);
  });

  socket.on("update_unread_msgs_counter", function(msg){
    console.log("Now or never");
    io.emit("update_unread_msgs_counter", "Now or never");
  });

  socket.on('counter', function(msg){
    console.log("for node server: Counter");
    io.emit('counter', msg);
  });

});

http.listen(3001, function(){  
  console.log('listening on *:3001');
});