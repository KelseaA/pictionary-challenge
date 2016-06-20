var http = require("http");
var express = require("express");
var socket_io = require("socket.io");

var app = express();
app.use(express.static("public"));

var server = http.Server(app);
var io = socket_io(server);

//pictionary application variables
var users = [];

io.on("connection", function(socket){
	socket.on("newUser", function(newUser){
		console.log(newUser);
		console.log(socket.id);
		users[socket.id] = newUser;
		socket.emit("updateUsers", users);
	});
	socket.on("disconnect", function(){
		console.log(socket.id);
		delete users[socket.id];
		console.log(users);
		socket.emit("updateUsers", users);
	});
});

server.listen(8080);