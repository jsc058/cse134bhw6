function login() {
  var userEmail = document.getElementById("email_field").value;
  var userPassword = document.getElementById("password_field").value;
  console.log(userEmail);
  console.log(userPassword);

  firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode === 'auth/wrong-password') {
      alert('Wrong password.');
    } else {
      alert(errorMessage);
    }
    return;
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Logged in");
      window.location = window.location.origin + '/home.html';
    } else {
      // No user is signed in.
    }
  });
}

function createAccount() {
  document.getElementById("email_field2").value = "";
  document.getElementById("password_field2").value = "";
  document.getElementById('login').style.display = "none";
  document.getElementById('signup').style.display = "block";
}

function cancel() {
  document.getElementById("email_field").value = "";
  document.getElementById("password_field").value = "";
  document.getElementById('login').style.display = "block";
  document.getElementById('signup').style.display = "none";
}

function signUp() {
  var userEmail = document.getElementById("email_field2").value;
  var userPassword = document.getElementById("password_field2").value;
  console.log(userEmail);
  console.log(userPassword);
  firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("Here");
    alert("Error: " + errorMessage);
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Signed up");
      window.location = window.location.origin + '/home.html';
    } else {
      // No user is signed in.
    }
  });
}
