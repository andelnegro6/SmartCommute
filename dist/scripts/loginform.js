"use strict";

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";
  } else {
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";
  }
});
function login() {

  var userEmail = document.getElementById("Email_field").value;
  var userPassword = document.getElementById("Password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    window.alert('Error: ' + errorMessage);
  });

  window.alert(userEmail + " " + userPassword); //WORKS!
}

function logout() {
  firebase.auth().signOut().then(function () {
    // Sign-out successful.
  }).catch(function (error) {
    // An error happened.
  });
}