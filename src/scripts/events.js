function checkUser(){
  return new Promise(function(resolve, reject){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var uid = user.uid;
        resolve(uid);
      } else {
        reject("User is not logged in");
      }
    });
  });
}

//must load from firebase DB all the events of the current user:
var events = function(){ 
  checkUser().then(function(uid){
    var eventReference = firebase.database().ref('users/' + uid + "/events/"); 
    eventReference.once('value', gotData, errData); //loads once all the events, but does not match them with their key!
  }).catch(function(error){
    alert(error);
  });
};

function gotData (data) {
  var myEventsArray = [];
  var eventlist = data.toJSON();
  //console.log(eventlist); //shows: {event{dataevent}, event2{}, event3{}}
  for (var key in eventlist){ //iterates through all events
    var value = eventlist[key];
    myEventsArray.push(value);  //appends to eventsarray each value of each event
    $('#calendar').fullCalendar('renderEvent', myEventsArray, true);
  };
  $('#calendar').fullCalendar('addEventSource', myEventsArray); //adds myEventsArray as a source to the calendar
}

function errData (err) {
  console.log("ERROR!" + err);
}

events();

// var eventReference = firebase.database().ref('users/' + uid + "/events/");
  // eventReference.on('value', gotData, errData);
  // eventReference.once("value").then(function(snapshot){
  //   snapshot.forEach(function(childSnapshot){
  //     var eventId = childSnapshot.key; //this should give each event id
  //     var eventsData = childSnapshot.val(); //{event values}
  //     return eventId, eventsData;
  //   });
  // });