var uploader;
var fileButton;
var selectedFile;
var inputUrl;
var currentUser;
var imageObj;
var canvas;
var context;
var top_text = "";
var bot_text = "";
var imgName = "";

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    currentUser = user;
  } else {
    // No user is signed in.
  }
});

window.onload = function() {
  //uploader = document.getElementById('uploader');
  fileButton = document.getElementById('fileButton');
  var close = document.getElementById('x-out');
  var signOut = document.getElementById('signOut');
  var changePassword = document.getElementById('changePassword');
  fileButton.addEventListener('change', function(e) {
    selectedFile = e.target.files[0];
    console.log(selectedFile);
    if (!selectedFile.type.includes("image")) {
      fileButton.value = null;
        var errMsg = document.getElementById('imgError');
        errMsg.style.display = "block";
        errMsg.innerHTML="Please select a valid image file.";
      return;
    }
    document.getElementById('import-upload').innerHTML = selectedFile.name;
  });

  close.addEventListener('click', closeUpload);
  signOut.addEventListener('click', logout);
  changePassword.addEventListener('click', showChangePass);

  canvas = document.getElementById('currentMeme');
  context = canvas.getContext("2d");
  imageObj = new Image();
  imageObj.crossOrigin="anonymous";
  drawPlaceholder();
};

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

function showChangePass() {
  document.getElementById('canvas_controls').style.display = "block";
  document.getElementById('user_controls').style.display = "block";
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
  document.getElementById('imgError').style.display = "none";
  document.getElementById('upload_controls').style.display = "none";
}

function showUploads() {
  document.getElementById('canvas_controls').style.display = "block";
  document.getElementById('upload_controls').style.display = "block";
}

function drawPlaceholder() {
  imageObj.onload = function() {
    canvas.width = 500;
    canvas.height = 500;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawOverlay(imageObj);
    drawTopText();
    dynamicTopText(imageObj);
    drawBotText();
    dynamicBotText(imageObj);
    saveUrl();
  };

  imageObj.src = "https://firebasestorage.googleapis.com/v0/b/mymememaster-60d3d.appspot.com/o/memes%2Fdog2.jpg?alt=media&token=3d72bafd-254c-4657-8c3c-4b34f8067c88";
}

function drawOverlay(img) {
    if (img.height < canvas.height) {
      canvas.height = img.height;
    }

    if (img.width < canvas.width) {
      canvas.width = img.wdith;
    }

    context.drawImage(img,0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    var pattern =context.createPattern(img,"no-repeat");
    context.fillStyle = pattern;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTopText() {
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.textBaseline = 'middle';
    context.font = "50px 'Impact'";
    context.lineWidth = 7;
    context.strokeText(top_text, 50, 50);
    context.lineWidth = 1;
    context.fillText(top_text, 50, 50);
}

function drawBotText() {
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.textBaseline = 'middle';
    context.font = "50px 'Impact'";
    context.lineWidth = 7;
    context.strokeText(bot_text, 50, 350);
    context.lineWidth = 1;
    context.fillText(bot_text, 50, 350);
}

function dynamicTopText(img) {
  document.getElementById('topText').addEventListener('keyup', function(e) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawOverlay(img);
    if (e.keyCode == 13 || e.keyCode == 8) {
      top_text = top_text.slice(0,-1);
    }
    drawBotText();
    drawTopText();
    top_text = this.value;
    context.lineWidth = 7;
    context.strokeText(top_text, 50, 50);
    context.lineWidth = 1;
    context.fillText(top_text, 50, 50);
  });
}

function dynamicBotText(img) {
  document.getElementById('bottomText').addEventListener('keyup', function(e) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawOverlay(img);
    if (e.keyCode == 13 || e.keyCode == 8) {
      bot_text = bot_text.slice(0,-1);
    }
    drawTopText();
    drawBotText();
    bot_text = this.value;
    context.lineWidth = 7;
    context.strokeText(bot_text, 50, 350);
    context.lineWidth = 1;
    context.fillText(bot_text, 50, 350);
  });
}

function uploadFile() {
  inputUrl = document.getElementById('upload-url').value;
  if (selectedFile == null && inputUrl == null) {
    return;
  }

  if (inputUrl != "" && inputUrl != null) {
    imgName = inputUrl.value + currentUser.uid;
    imageObj.src = inputUrl;
  } else if(selectedFile != null) {
    imgName = selectedFile.name + currentUser.uid;
    var storageRef = firebase.storage().ref('/memes/' + imgName);
    var uploadTask = storageRef.put(selectedFile);

    uploadTask.on('state_changed',
      function progress(snapshot) {
      },
      function error(err) {

      },
      function complete() {
        var postKey = firebase.database().ref('Posts/').push().key;
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          console.log('File available at', downloadURL);
          imageObj.src = downloadURL;
          var updates = {};
          var postData = {
            url: downloadURL,
            editUrl: "",
            topText: "",
            botText: "",
            user: currentUser.uid,
            title: imgName,
            // title: filename + currentUser.uid,
            date: selectedFile.lastModifiedDate
          };
          updates['/Posts/' + postKey] = postData;
          firebase.database().ref().update(updates);
          closeUpload();
        });
      });
  }
}

function saveUrl() {
  var dataUrl = canvas.toDataURL('image/jpeg');
  var imageUrl = dataUrl.split(",");
  var storageRef = firebase.storage().ref('/memes/' + imgName);
  var uploadTask = storageRef.putString(imageUrl[1], 'base64', {contentType:'image/jpg'});

  uploadTask.on('state_changed',
    function progress(snapshot) {
    }, function error(err) {

    },
    function complete() {
      var postKey = firebase.database().ref('Posts/').push().key;
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log('File available at', downloadURL);
        var updates = {};
        var postData = {
          url: downloadURL,
          editUrl: "",
          topText: "",
          botText: "",
          user: currentUser.uid,
          title: imgName,
          date: new Date()
        };
        updates['/Posts/' + postKey] = postData;
        firebase.database().ref().update(updates);
        closeUpload();
      });
    });
}

function saveMeme() {
  var dataUrl = canvas.toDataURL('image/jpeg');
  var imageUrl = dataUrl.split(",");
  var storageRef = firebase.storage().ref('/memes/edit' + imgName);
  var uploadTask = storageRef.putString(imageUrl[1], 'base64', {contentType:'image/jpg'}).then(function(snapshot) {
    storageRef.getDownloadURL().then(function(downloadURL) {
      console.log('File available at', downloadURL);
      var ref = firebase.database().ref('/Posts/');
      ref.orderByChild('title').equalTo(imgName).on('value', function(snapshot) {
        var key = Object.keys(snapshot.val());
        var childRef = firebase.database().ref('/Posts/'+key[0]);
        childRef.update({
          editUrl: downloadURL,
          topText: top_text,
          botText: bot_text
          });
          imgName = "";
          window.location = window.location.origin + '/myMemes.html';
      });
    });
  });
}

function logout() {
  console.log("Logging out");
  firebase.auth().signOut().then(function() {
  // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}
