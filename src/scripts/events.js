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
//must load from firebase DB all the events of the current user!
var events = function(){ 
  checkUser().then(function(uid){
    console.log("i just passed " + uid + " successfully!");
    var eventReference = firebase.database().ref('users/' + uid + "/events/");
    eventReference.on('value', gotData, errData);
  }).catch(function(error){
    alert(error);
  });
};

function gotData (data) {
  var myEventsArray = [];
  var eventlist = data.toJSON();
  console.log(eventlist); //shows: {event{dataevent}, event2{}, event3{}}
  for (var key in eventlist){ //iterates through all events
    var value = eventlist[key];
    console.log(value)
    myEventsArray.push(value);  //appends to eventsarray each value of each event
  };
  console.log(myEventsArray.length) //checks how many events we have
  $('#calendar').fullCalendar('addEventSource', myEventsArray); //adds myEventsArray as a source to the calendar
}

function errData (err) {
  console.log("ERROR!" + err);
}
//returns an array of the form: [{eventData}, {eventData2}, ...];

// [{
//   id: 1,
//   title: "Well, you said you wanted to be around when I made a mistake.",
//   description: 'description for Birthday Part22w2w21w21w2w',
//   start: "2018-11-04T14:30:00.000Z",
//   end: "2018-11-06T18:30:00.000Z"
//   },

//   {
//   id: 2,
//   title: "Lunch Time",
//   description: 'description for Birthday Party',
//   start: '13:00',
//   end: '14:00',
//   backgroundColor:'#FFD700',
//   dow:[0,1,2,3,4,5,6]
//   },

//   {
//   id: 3,
//   title: "4days-20-23",
//   description: 'Rome Travel',
//   start: "2018-11-20T09:00:00.000Z",
//   end: "2018-11-23T18:25:00.000Z",
//   dow:[0,1,2,3,4,5,6]
//   }]

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