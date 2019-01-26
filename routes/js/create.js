$(document).ready(function() {

	$("#form").submit(function(event){
	    event.preventDefault();
	    var session = document.getElementById("session").value;
	    var password1 = document.getElementById("password1").value;
	    var password2 = document.getElementById("password2").value;

	    if(password1.length < 6 || password1.length > 25) {
	    	alert("Password must be between 6-25 characters");
	    }
	    else if(password1 != password2) {
	    	alert("Passwords don't match!");
	    }
	    else {
	    	$.post('/create', {
	    		session: session, password: password,
			}, function(data){
                window.location.href = "/";
            });



	    }


  });
});