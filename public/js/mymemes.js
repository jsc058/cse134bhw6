var token;

window.onload = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      token = firebase.auth().currentUser.uid;
      queryDatabase(token);
    } else {
      window.location = window.location.origin + '/login.html';
    }
  });

  var signOut = document.getElementById('signOut');
  var changePassword = document.getElementById('changePassword');
  var close = document.getElementById('x-out');

  close.addEventListener('click', closeUpload);
  signOut.addEventListener('click', logout);
  changePassword.addEventListener('click', showChangePass);
}

function queryDatabase(token) {
  var ref = firebase.database().ref('/Posts/');
  ref.orderByChild('user').equalTo(token).on('value', function(snapshot) {
    var myNode = document.getElementById('myMemes');
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    var userMemes = snapshot.val();
    console.log(userMemes);
    var keys = Object.keys(userMemes);
    var currentRow;
    console.log(keys);
    for (var i = 0; i < keys.length; i++) {
      var currentMeme = userMemes[keys[i]];
      console.log(currentMeme);

      if ((currentMeme.editUrl == null) || currentMeme.editUrl === "") {
        continue;
      }

      currentRow = document.createElement("div");
      currentRow.className = "memeHolder";

      var col = document.createElement("div");
      col.className = "memeImage";
      var image = document.createElement("img");
      image.src = currentMeme.editUrl;
      image.height = 200;
      image.width = 200;

      var buttons = document.createElement("div");
      buttons.className = "buttonsArea";

      var trashBtn = document.createElement("button");
      trashBtn.setAttribute('class', "memeButtons");
      trashBtn.setAttribute('id', 'delete,'+keys[i]);
      trashBtn.addEventListener('click', deleteMeme.bind({},keys[i]));
      var trashTxt = document.createTextNode("Delete");
      trashBtn.appendChild(trashTxt);

      var editBtn = document.createElement("button");
      editBtn.setAttribute('class', "memeButtons");
      editBtn.setAttribute('id', 'edit,'+keys[i]);
      editBtn.addEventListener('click', editMeme.bind({},keys[i]));
      var editTxt = document.createTextNode("Edit");
      editBtn.appendChild(editTxt);

      buttons.appendChild(trashBtn);
      buttons.appendChild(editBtn);
      col.appendChild(image);
      col.appendChild(buttons);
      currentRow.appendChild(col);
      document.getElementById('myMemes').appendChild(currentRow);
    }
  });
}

function editMeme(postKey) {

}

function deleteMeme(postKey) {
  console.log("deleting meme");
  console.log(postKey);
  var ref = firebase.database().ref('/Posts/'+postKey);
  ref.remove()
    .then(function() {
      console.log("Remove succeeded.");
    })
    .catch(function(error) {
      console.log("Remove failed: " + error.message)
    });
}

function showChangePass() {
  document.getElementById('canvas_controls').style.display = "block";
  document.getElementById('user_controls').style.display = "block";
}

function checkPass() {
  var userProvidedPassword = document.getElementById('oldPass').value;
  var credential = firebase.auth.EmailAuthProvider.credential(
    currentUser.email,
    userProvidedPassword
  );

  // Prompt the user to re-provide their sign-in credentials
  currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(function() {
    var newPass = document.getElementById('newPass').value;
    if( (newPass === "") || (newPass !== document.getElementById('newPass2').value) ) {
      var errMsg = document.getElementById('passError');
      errMsg.style.display = "block";
      errMsg.innerHTML="New passwords don't match.";
    }

    currentUser.updatePassword(newPass).then(function() {
      alert('Password has changed. Please login again with new password.');
      logout();
    }).catch(function(error) {
      console.log(error);
    });
  }).catch(function(error) {
    var errMsg = document.getElementById('passError');
    errMsg.style.display = "block";
    errMsg.innerHTML="Old password is incorrect.";
  });
}

function closeUpload() {
  var parent = document.getElementById('canvas_controls');
  var parentInputs = parent.getElementsByTagName('input');
  for (var i = 0; i < parentInputs.length; i++) {
    parentInputs[i].value = "";
  }
  parent.style.display = "none";
  document.getElementById('user_controls').style.display = "none";
  document.getElementById('passError').style.display = "none";
}

function logout() {
  console.log("Logging out");
  firebase.auth().signOut().then(function() {
  // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}
