(function(){
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        return true;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'main.html',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: 'main.html',
    // Privacy policy url.
    privacyPolicyUrl: 'main.html'
  };
  ui.start('#firebaseui-auth-container', uiConfig);
})()





















































//reference messages collection
// var messagesRef = firebase.database().ref('messages');

//document.getElementById('signupform').addEventListener('submit', submitform);


// firebase.auth().onAuthStateChanged(function(user){
//   if (user){
//     document.getElementById("user_div").style.display = "block";
//     document.getElementById("login_div").style.display = "none";
//   }else{
//     document.getElementById("user_div").style.display = "none";
//     document.getElementById("login_div").style.display = "block";
//   }
// });
//
// function login() {
//
//   var userEmail = document.getElementById("Email_field").value;
//   var userPassword = document.getElementById("Password_field").value;
//
//   firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//
//   window.alert('Error: ' + errorMessage);
// });
//
//   window.alert(userEmail + " " + userPassword); //WORKS!
// }
//
// function logout() {
//   firebase.auth().signOut().then(function() {
//   // Sign-out successful.
//   }).catch(function(error) {
//   // An error happened.
//   });
// }

//submit form
// function submitform(e) {
//   e.preventDefault();
//   //get values
//   var username = getinputval('username');
//   var email = getinputval('emailsu');
//   var password = getinputval('passwordsu');
//   console.log(username);
//   // saveMessage(username, email, password);
//
//   document.querySelector('.alert').style.display = 'block';
//
//   //hide after 1sec
//   setTimeout(function(){
//     document.querySelector('.alert').style.display = 'none';
//   },3000);
//
//   document.getElementById('signupform').reset();
//   firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // ...
//   };
//
// function getinputval(id){
//   return document.getElementById(id).value;
// }
// }

// function saveMessage(username, email, password){
//   var newMessageRef = messagesRef.push();
//   newMessageRef.set({
//     username : username,
//     email : email,
//     password : password
//   });
// }
