var socket = io();
var selectedAvatar = "avatars/avatar1.png";
var messages = [];

var User = function(firstName, lastInitial, avatar){
	this.firstName = firstName,
	this.lastInitial = lastInitial,
	this.avatar = avatar
}

var updateUsers = function(users){
	console.log(users);
}

var newMessage = function(message){
	console.log(message);
}

socket.on("updateUsers", updateUsers);
socket.on("newMessage", newMessage);

//Select avatar icon on click
$(".avatar-icons").on("click", function(){
	$(".avatar-icons").removeClass("selected");
	$(this).addClass("selected");
	console.log("avatar click");

	//Assign avatar image choice to user on avatar click
	selectedAvatar = $(".selected").attr("src");
	console.log(selectedAvatar);

	$(".chosen-avatar").html('<img class="avatar-icons" src="' + selectedAvatar + '">');
});

// Create a new user with name selections on submit click
$(".user-submit").on("click", function(){
	//Assign value of first and last name inputs to variables
	var firstName = $("#first-name").val();
	console.log(firstName);
	var lastInitial = $("#last-initial").val();
	console.log(lastInitial);
	
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
	console.log(message);
	if("" != message){
		socket.emit("sendMessage", message);
	}
}


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
        lastEvent = event;
        drawing = true;
    }).on("mousemove", function(event) {
       if(drawing){
            context.beginPath();
            context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
            context.lineTo(event.offsetX, event.offsetY);
            context.strokeStyle = color;
            context.stroke();
            lastEvent = event;
        }
    }).on("mouseup", function(event){
        drawing = false;
    }).on("mouseleave", function(){
        canvas.mouseup();
    });
};


$(document).ready(function() {
    pictionary();
});




