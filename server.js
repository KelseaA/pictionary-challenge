var http = require("http");
var express = require("express");
var socket_io = require("socket.io");

var app = express();
app.use(express.static("public"));

var server = http.Server(app);
var io = socket_io(server);

//pictionary application variabless
var users = [];
var usersIndex = [];

var Message = function(user, message){
	this.user = user;
	this.message = message;
}

io.on("connection", function(socket){
	socket.on("disconnect", function(){
        // console.log(users[socket.id].firstName + " " + users[socket.id].lastInitial + " has disconnected");
        var disconnectedUser = usersIndex.indexOf(socket.id);
        console.log(users);
        usersIndex.splice(disconnectedUser, 1);
        users.splice(disconnectedUser, 1);

		io.emit("updateUsers", users);
	});
	socket.on("newUser", function(newUser){
		usersIndex[socket.id] = newUser;
		users.push(newUser);
		console.log(users);
		io.emit("updateUsers", users);
	});
	socket.on("sendMessage", function(message){
		message = new Message(users[socket.id], message);
		io.emit("newMessage", message);
	});
	socket.on('draw', function(event){
        socket.broadcast.emit('draw', event);
    });
	socket.on('startDrawing', function(event){
        socket.broadcast.emit('startDrawing', event);
    });
});

server.listen(8080);