
var http = require("http");
var express = require("express");
var socket_io = require("socket.io");

var app = express();
app.use(express.static("public"));

var server = http.Server(app);
var io = socket_io(server);

//pictionary application variables
var users = [];
var usersIndex = [];
var drawingUser = null;
var guessWord = "";
var words = ["letter", "balloon", "number", "person", "pen", 
	"class", "music", "water", "man", "woman", "boy", "cat", "mouse", "robot", 
	"girl", "Christmas", "Halloween", "name", "flower", "boat", 
	"hand", "house", "pig", "mother", "father", "corn", "brother", "sister", 
	"world", "head", "country", "school", "pizza", "sun", "sundae", 
	"eye", "Eiffel Tower", "tree", "farm", "story", "sea", "night", "day", 
	"child", "paper", "river", "car", "goat", "feet", 
	"book", "science", "room", "friend", "idea", "fish", "mountain", "horse", 
	"watch", "rainbow", "face", "wood", "list", "bird", "body", "dog", "family", 
	"song", "door", "wind", "ship", "rock", "fire", "king"
];

var User = function(firstName, lastInitial, avatar){
	this.firstName = firstName,
	this.lastInitial = lastInitial,
	this.avatar = avatar
}

var Message = function(user, message){
	this.user = user;
	this.message = message;
}

function getWord() {
	var index = Math.floor(Math.random() * (words.length - 1));
	return words[index];
};


io.on("connection", function(socket){
	socket.on("newUser", function(newUser){
		newUser.id = socket.id;
		users.push(newUser);
		io.emit("newWebMessage", newUser.firstName + " " + newUser.lastInitial + " just connected");
		io.emit("updateUsers", users);
		if(null === drawingUser){
			drawingUser = socket.id;
			guessWord = getWord();
			var data = {iAmDrawing: true, word: guessWord};
			socket.emit("newGame", data);
		}
		else{
			var data = {iAmDrawing: false};
			socket.emit("newGame", data);
		}
	});
	socket.on("sendMessage", function(message){
		for(var i = 0; i < users.length; i++){
			if(socket.id === users[i].id){
				message = new Message(users[i], message);
        		io.emit("newMessage", message);
        		break;
        	}
		}
	});
	socket.on('draw', function(event){
		socket.broadcast.emit('draw', event);
	});
	socket.on('startDrawing', function(event){
		socket.broadcast.emit('startDrawing', event);
	});
	socket.on("checkUserWord", function(word, fn){
		for(var i = 0; i < users.length; i++){
			if(socket.id === users[i].id){
				var user = users[i];
        		break;
        	}
		}
		if(guessWord.toLowerCase() === word.toLowerCase()){
			//emitting game winner
			io.emit("newWebMessage", "Congratulations, " + user.firstName + " " + user.lastInitial + "! You guessed correctly. The word is " + guessWord);
			//sets new secret word
			guessWord = getWord();
			//sets new drawer to last winner
			drawingUser = socket.id; 

			//makes everyone not drawers
			var data = {iAmDrawing: false};
			socket.broadcast.emit("newGame", data);

			//makes last winner drawer
			var data = {iAmDrawing: true, word: guessWord};
			socket.emit("newGame", data);

			//lets users know who the new drawer is
			io.emit("newWebMessage", "It's " + user.firstName + " " + user.lastInitial + "'s turn to draw");
			fn(true);
        }
		else{
			socket.emit("newWebMessage", "Sorry, your guess is incorrect, " + user.firstName + " " + user.lastInitial);
			fn(false);
		}
	});
	socket.on("disconnect", function(){
        for(var i = 0; i < users.length; i++){
        	if(socket.id === users[i].id){
        		io.emit("newWebMessage", users[i].firstName + " " + users[i].lastInitial + " just disconnected");
        		users.splice(i, 1);
        		io.emit("updateUsers", users);
        		break;
        	}
        }
        if(socket.id === drawingUser){
        	if(0 == users.length){
        		drawingUser = null;
        	}
        	else{
        		var index = Math.floor(Math.random() * (users.length - 1));
        		drawingUser = users[index].id;
        		var data = {iAmDrawing: true, word: guessWord};
        		io.emit("newWebMessage", "It's " + users[index].firstName + " " + users[index].lastInitial + "'s turn to draw");
        		io.to(users[index].id).emit("newGame", data);
        	}
			
		}
    });
});

app.set("port", process.env.PORT || 8080);
server.listen(process.env.PORT || 8080);
