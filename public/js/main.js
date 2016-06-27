var socket = io();
var selectedAvatar = "avatars/avatar1.png";
var messages = $(".messages");

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

var User = function(firstName, lastInitial, avatar){
	this.firstName = firstName,
	this.lastInitial = lastInitial,
	this.avatar = avatar
}

var DrawPosition = function(offsetX, offsetY, color){
	this.offsetX = offsetX,
	this.offsetY = offsetY,
	this.color = color
}

var updateUsers = function(users){
	//clear users container
		$(".users").empty();
		console.log("Emptying container...");
		
	for (var i = 0; i < users.length; i++){
		//assign users' firstName, lastInitial, and avatar to variables
		var name = users[i].firstName;
		var initial = users[i].lastInitial;
		var user = name + " " + initial;
		var avatarSrc = users[i].avatar;

		//Add updated users to users container
		$(".users").append('<div class="user"><img class="avatar-icons" src="' + avatarSrc + '"><h3>' + user + '</h3></div>')
		console.log("Appending users...");
	}
}

var newMessage = function(message){
	var name = message.user.firstName;
	var initial = message.user.lastInitial;
	var user = name + " " + initial;
	var userMessage = message.message;
	messages.append('<div class="chat-messages">' + user + ": " + userMessage + "</div>");
}

socket.on("updateUsers", updateUsers);
socket.on("newMessage", newMessage);


//Send chat message button on click
$("#chat-submit").on("click", function(){
	sendMessage($("#chatbox").val());
	$("#chatbox").val("");
});

//Send chat message on enter keypress
$("#chatbox").on("keyup", function(event){
	if(13 == event.which){
		sendMessage($("#chatbox").val());
		$("#chatbox").val("");
	}
});

//Send chat message function
function sendMessage(message){
	console.log("This is my enter key message: " + message);
	if("" != message){
		socket.emit("sendMessage", message);
	}
}


//Select avatar icon on click
$(".avatar-icons").on("click", function(){
	$(".avatar-icons").removeClass("selected");
	$(this).addClass("selected");

	//Assign avatar image choice to user on avatar click
	selectedAvatar = $(".selected").attr("src");

	$(".chosen-avatar").html('<img class="avatar-icons" src="' + selectedAvatar + '">');
});

// Create a new user with name selections on submit click
$(".user-submit").on("click", function(){
	//Assign value of first and last name inputs to variables
	var firstName = $("#first-name").val();
	var lastInitial = $("#last-initial").val();
	
	//If no name is entered, shake missing area
	if(firstName == "" && lastInitial == ""){
		$(".enter-names").addClass("animated shake");
	}
	else if(firstName == ""){
		$("#first-name").addClass("animated shake");
	}
	else if(lastInitial == "" || lastInitial.length > 1) {
		$("#last-initial").addClass("animated shake");
		$("#last-initial").val("");
	}
	else{
		//Add username to div on main game 
		$(".username").html("<h2>" + firstName + " " + lastInitial + "</h2");

		var myUser = new User(firstName, lastInitial, selectedAvatar);
		socket.emit("newUser", myUser);

		//Hide sign in page and show main page
		$(".sign-in-container").hide();
	}
});


var pictionary = function() {
    var color = $(".selected-color").css("background-color");
    var canvas = $("#canvas");
    var context = canvas[0].getContext("2d");
    var lastEvent;
    var drawing = false;

    
    //change selected color on click
    $(".controls").on("click", "li", function(){
        //Deselect sibling elements
        $(this).siblings().removeClass("selected-color");
  
        //Select clicked element
        $(this).addClass("selected-color");
  
        //Cache current color
        color = $(this).css("background-color");
    });
    
    //On mouse events on the canvas
    canvas.on("mousedown", function(event){
        lastEvent = new DrawPosition(event.offsetX, event.offsetY, color);
        socket.emit("startDrawing", lastEvent);
        drawing = true;
    }).on("mousemove", function(event) {
       if(drawing){
            var newCanvasPosition = new DrawPosition(event.offsetX, event.offsetY, color);
            draw(newCanvasPosition);
            socket.emit("draw", newCanvasPosition);
        }
    }).on("mouseup", function(event){
        drawing = false;
    }).on("mouseleave", function(){
        canvas.mouseup();
    });

    function getWord() {
		var index = Math.floor(Math.random() * (WORDS.length - 1));
		return WORDS[index];
	};

    function startDrawing(event){
    	lastEvent = new DrawPosition(event.offsetX, event.offsetY, color);
    }

    function draw(event){
    	context.beginPath();
        context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
        context.lineTo(event.offsetX, event.offsetY);
        context.strokeStyle = event.color;
        context.stroke();
        lastEvent = event;
    }

    socket.on("draw", draw);
    socket.on("startDrawing", startDrawing);
};


$(document).ready(function() {
    pictionary();
});




