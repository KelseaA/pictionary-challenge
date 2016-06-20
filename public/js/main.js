var socket = io();
var selectedAvatar = "avatars/avatar1.png";

var User = function(firstName, lastInitial, avatar){
	this.firstName = firstName,
	this.lastInitial = lastInitial,
	this.avatar = avatar
}

var updateUsers = function(users){
	console.log(users);
}

socket.on("updateUsers", updateUsers);

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
	//If no name is entered or avatar chosen, alert user to make a selection
	if(firstName == "" && lastInitial == ""){
		$(".enter-names").addClass("animated shake");
	}
	else if(firstName == ""){
		$("#first-name").addClass("animated shake");
	}
	else if(lastInitial == "") {
		$("#last-initial").addClass("animated shake");
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
