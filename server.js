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
var words = ["word", "letter", "balloon", "number", "person", "pen", 
	"class", "music", "water", "man", "woman", "boy", "cat", "mouse", "robot", 
	"girl", "year", "Christmas", "Halloween", "name", "flower", "air", "boat", 
	"hand", "house", "pig", "mother", "father", "corn", "brother", "sister", 
	"world", "head", "country", "question", "school", "pizza", "sun", "sundae", 
	"eye", "Eiffel Tower", "tree", "farm", "story", "sea", "night", "day", "north", 
	"south", "east", "west", "child", "paper", "river", "car", "goat", "feet", 
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
		message = new Message(users, message);
		for(var i = 0; i < users.length; i++){
			console.log(users[i]);
			io.emit("newMessage", message);
		}
		console.log(message);
		io.emit("newMessage", message);
	});
	socket.on('draw', function(event){
		socket.broadcast.emit('draw', event);
	});
	socket.on('startDrawing', function(event){
		socket.broadcast.emit('startDrawing', event);
	});
	socket.on("disconnect", function(){
        // console.log(users[socket.id].firstName + " " + users[socket.id].lastInitial + " has disconnected");
        for(var i = 0; i < users.length; i++){
        	if(socket.id === users[i].id){
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
        		//send message to this user that they are drawing - iAmDrawing = true
        			//message after receiving braodcast
        		//send message to all other users saying it's a new game but they're not drawing
        			//broadcast

    //     		var data = {iAmDrawing: true, word: getWord()};
				// socket.emit("newGame", data);
        	}
			
		}
    });
});

server.listen(8080);