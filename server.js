var http = require("http");
var express = require("express");
var socket_io = require("socket.io");

var app = express();
app.use(express.static("public"));

var server = http.Server(app);
var io = socket_io(server);

//pictionary application variables
var users = [];

var Message = function(user, message){
	this.user = user;
	this.message = message;
}

io.on("connection", function(socket){
	socket.on("newUser", function(newUser){
		console.log(newUser);
		console.log(socket.id);
		users[socket.id] = newUser;
		socket.emit("updateUsers", users);
	});
	socket.on("sendMessage", function(message){
		message = new Message(users[socket.id], message);
		socket.emit("newMessage", message);
	})
	socket.on("disconnect", function(){
		console.log(socket.id);
		delete users[socket.id];
		console.log(users);
		socket.emit("updateUsers", users);
	});
});

server.listen(8080);