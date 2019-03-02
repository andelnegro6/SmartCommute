// import {myPlatform} from '../../main.html'
$(document).ready(function(){

  $('#calendar').fullCalendar({
    header: {
    left: 'today prev,next',
    center: 'title',
    right: 'timelineDay,timelineThreeDays,agendaWeek,month,listWeek'
  },
    eventOverlap: false,
    slotEventOverlap: false,
    allDay:true,
    selectable: true,
    selectHelper: true,
    defaultView: 'month',
    navLinks: true, // can click day/week names to navigate views
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    timezone: 'America/Chicago',

    select: function(startDate, endDate) { //triggered once several days are selected
      var inicio = startDate.format(); 
      var fin = endDate.format();     
      var finDate = new Date(endDate);
      var endDay = finDate.getUTCDate() -1; //correct day as an integer
      var endDay2digits = '';
      if(endDay.toString().length < 2){
        endDay2digits = '0' + endDay.toString();
      }else{
        endDay2digits = endDay.toString();
      }
      var fin2 = fin.substr(0, 8); //'YYYY-MM-'
      var fin3 = ''.concat(fin2 + endDay2digits); //'YYYY-MM-dd'
      newEvent(inicio, fin3);
    },

    dayClick: function(startDate) { //triggered once a day is clicked
      var endDate = startDate;
      var fechaInicio = new Date(startDate);
      //var fstringInicio = $.fullCalendar.formatDate(fechaInicio, 'yyyy-MM-dd');
      var inicio = startDate.format();
      //var fstringFin = fstringInicio;
      var fin = inicio;
      newEvent(inicio, fin); //pass in 'YYYY-MM-dd' formats
    },

    eventClick: function(calEvent, jsEvent, view) {
      editEvent(calEvent);
      //console.log(calEvent); //each event's ID is shown! good.
    },
  //Modify the event adding a new element and generate a pop over of title and description
    eventRender: function(eventObj, $el) {
      if (eventObj.start != null || eventObj.end != null){
        var inizio=eventObj.start.format().slice(11,16);
        var fine=eventObj.end.format().slice(11,16);
        var content = "start time: "+inizio+", end time: "+fine;
      }else{
        var content = "n/a";
      }
        $el.addClass(eventObj.description);
        $el.popover({
          title: eventObj.title,
          content: content,
          trigger: 'hover',
          placement: 'top',
          container: 'body'
        });
    },
    
    eventSources: ['src/scripts/events.js', 'src/scripts/settings.js']
    //events loads the previously saved events, settings loads the user's settings
  });
  //------------------------------------------------------------------------------

  var fixTo2Digits = function(digits){
    var fixedDigits;
    if(digits.length < 2){
      fixedDigits = '0' + digits;
    }else{
      fixedDigits = digits;
    };
    return fixedDigits;
  };

  //Create a newEvent
  var newEvent = function(start, end){
    $('#selected').text('selected days: ' + start + ' to ' + end); //shows on modal the selected date
    $('input#title').val("");
    $('textarea#info_description').val("");
    $('#newEvent').modal('show');
    $('#submit').unbind();

    $('#submit').on('click', function() {
      var title = $('input#title').val();
      var stiempo = $('input#stime').val();
      var etiempo = $('input#etime').val();
      var comentario = $('textarea#info_description').val();
      var location = $('input#newEventLocation').val();

      /*-------------------------get user data--------------------------------*/
      //to get the current user and link its info to the events:
      var user = firebase.auth().currentUser; //retrieve current user's info
      var name, email, uid, emailVerified; //declare the relevant data
      if (user != null) {
        name = user.displayName;
        email = user.email;
        emailVerified = user.emailVerified;
        uid = user.uid;  
        // The user's ID, unique to the Firebase project. Do NOT use
        // this value to authenticate with your backend server, if
        // you have one. Use User.getToken() instead.
      }
      //now we must load all event's start and end times here in date format:

      /*----------------------------------------------------------------------- */
      var startToParse = start + "T" + stiempo + ":00.000Z";
      var endToParse = end + "T" + etiempo + ":00.000Z";
      var startParsed = Date.parse(startToParse);
      var endParsed = Date.parse(endToParse);
      //console.log(endToParse, endParsed, startToParse, startParsed);
      var eventData = {
        title: title,
        start: start + "T" + stiempo + ":00.000Z",
        end: end + "T" + etiempo + ":00.000Z",
        description: comentario,
        location: location
      };
      if(title){
        validateEvents(uid, startParsed, endParsed, eventData);
      }else{
        alert("please insert a title");
      }
      
    });
  };
  
  //Edit an event:
  var editEvent = function(calEvent, jsEvent, view ) {
    console.log(calEvent.start, calEvent.end);
    $('#editSelected').text('Selected days: ' + calEvent.start.format().split('T', 1) + ' to ' + calEvent.end.format().split('T', 1));
    $('input#editTitle').val(calEvent.title);
    $('textarea#editinfo_description').val(calEvent.description);
    $('input#editEventLocation').val(calEvent.location);

    //extracts hours and minutes from calEvent (saved event) ONLY to show on modal:
    var updstHours = (calEvent.start._d.getHours() -1).toString();
    var updstMins = calEvent.start._d.getMinutes().toString();
    var updeHours = (calEvent.end._d.getHours() -1).toString();
    var updeMins = calEvent.end._d.getMinutes().toString();
    //fix 1 digit only error to comply with ISO:
    var startHoursFix = fixTo2Digits(updstHours);
    var startMinsFix = fixTo2Digits(updstMins);
    var endHoursFix = fixTo2Digits(updeHours);
    var endMinsFix = fixTo2Digits(updeMins);

    //Shows on modal:
    $('input#editstime').val(startHoursFix + ":" + startMinsFix);
    $('input#editetime').val(endHoursFix + ":" + endMinsFix);
    $('#editEvent').modal('show');
    $('#update').unbind();
  
    $('#update').on('click', function() {
      var title = $('input#editTitle').val();
      var stiempo = $('input#editstime').val(); //string 'hh:mm'
      var etiempo = $('input#editetime').val(); //string
      var comentario = $('textarea#editinfo_description').val();
      var location = $('input#editEventLocation').val();
      
      var user = firebase.auth().currentUser;
      var uid;
      if (user != null) {
        uid = user.uid; 
      };
      
      //change start and end moment elements to strings:
      var sDateUpdated = calEvent.start.format().split('T', 1);
      var eDateUpdated = calEvent.end.format().split('T', 1); 
      //console.log(sDateUpdated, eDateUpdated);

      //start and end dates as strings
      var f_inicio = sDateUpdated[0];
      var f_fin = eDateUpdated[0];
      //console.log(f_inicio, f_fin);

      var startToParse = f_inicio + " " + stiempo + " Z";
      var endToParse = f_fin + " " + etiempo + " Z";
      var startParsed = Date.parse(startToParse);
      var endParsed = Date.parse(endToParse);

      if (title){
        calEvent.description = comentario;
        calEvent.title = title;
        calEvent.start = f_inicio + "T"+ stiempo + ":00.000Z";
        calEvent.end = f_fin + "T" + etiempo + ":00.000Z";
        calEvent.location = location;
        
        var eventData={
          title: title,
          start: f_inicio + "T" + stiempo + ":00.000Z",
          end: f_fin + "T" + etiempo + ":00.000Z",
          description: comentario,
          location: location,
          id: calEvent.id
        };

        validateEvents(uid, startParsed, endParsed, eventData, calEvent);
      }else{
        alert("Title is blank. Try again.")
      }
    });
    
    //delete event
    $('#delete').on('click', function() {
      var user = firebase.auth().currentUser;
      var uid;
      if (user != null) {
        uid = user.uid;
      } 
      firebase.database().ref('users/' + uid + '/events/' + calEvent.id).set(null);
      $('#delete').unbind();
      eventRenderer();
      $('#editEvent').modal('hide');
    });
  }
});
var newEventKey;

var eventRenderer = function(){
  $('#calendar').fullCalendar('removeEvents'); 
  events();
}
/* --------------------------Others-------------------------- */
var getCal1Id = function(cal2Id) {
  var num = cal2Id.replace('_fc', '') - 1;
  var id = "_fc" + num;
  return id;
}
/* --------------------------others-------------------------- */
var disableEnter = function() {
  $('body').bind("keypress", function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      return false;
    }
  });
}

function allEventsOk(everyVal){
  return everyVal > 0;
}

function validateEvents(uid, start, end, eventData, calEvent) {
  if ((end - start) < 0 && eventData.title){ //step to verify no wrong time values (if start comes after the end)
    alert("event times are invalid. Please correct");
  } else{
    isNotColliding(uid, start, end, eventData, calEvent);
  }
}

function isNotColliding(uid, start, end, eventData, calEvent) { //start and end are date objects
  firebase.database().ref('users/' + uid + "/events/").once('value').then(function(data){
    var datas = data.toJSON();
    var allVals = new Array;
    var allEvNodes = new Array;
    var startM = moment(start);
    var startE = moment(end);
    //node information of event to be created:
    allEvNodes.push({'startTime': startM, 'endTime': startE, 'location': eventData.location});
    for(var i in datas){
      var value = datas[i];
      var eventsStart = moment(value.start);
      var eventsEnd = moment(value.end);
      if (eventsStart < end && eventsEnd > start){
        allVals.push(0);
      } else {
        allVals.push(1);
        //puts all non-colliding event start and locs in array:
        allEvNodes.push({'startTime': eventsStart, 'endTime': eventsEnd, 'location': value.location})
      }
    }
    if (eventData.id != null || eventData.id != undefined){
      allVals.pop(); //pops out the element correspondent to the current event data (to prevent self-comparison)
    }
    if (allVals.every(allEventsOk)){ //if no other event overlaps
      var currentTime = moment();
      if (currentTime - start >= 0){ //if event has passed 
        if (eventData.id == null || eventData.id == undefined){ //if event is new so there's no event id:
          newEventAdditionProcess(uid, eventData);
        } else { //if event exists therefore id is existent:        
          eventModificationProcess(uid, calEvent, eventData);
        }
      } else { //if event is yet to happen, first must check if it's the next event or not
        var { evlocs, evstimes, evetimes } = generateNodes(allEvNodes, currentTime);
        var eventNodes = {evlocs, evstimes, evetimes};
        console.log(evlocs, evstimes, evetimes); //these are the event nodes.
        //events locations and times now ordered and only upcoming ones are present
        var myPlatform = new H.service.Platform({
          'app_id': 'SKrth5W6mIRCcxVYfDWi',
          'app_code': 'bW5PezhhynKJWF85-sSZlA'
          });
        if (evlocs[0] == eventData.location){ //if the event to be created is next event:
          navigator.geolocation.getCurrentPosition(function(pos){
            var myPosCoords = pos.coords;
            geocodeNext(myPlatform, eventData, calEvent, myPosCoords, currentTime, uid, startM);
          });
        }else{ //if the event happens after one or more upcoming existing events:
          geocodeDef(myPlatform, eventNodes, eventData, calEvent, uid, startM);
        }
      }
    } else {
      alert("One or more events overlapping. Try changing the time.");
    }
  });
};

function generateNodes(allEvNodes, currentTime) {
  var evlocs = [];
  var evstimes = [];
  var evetimes = [];
  allEvNodes.push({ 'startTime': currentTime, 'endTime': 'n/a', 'location': 'NOW' });
  allEvNodes.sort(function (a, b) { return a.startTime - b.startTime; }); //sort start times in ascending order allEvTimes[0] is most recent start time
  console.log(allEvNodes); //events organized
  for (var k = 0; k < allEvNodes.length; k++) { //events separated
    evlocs.push(allEvNodes[k].location);
    evstimes.push(allEvNodes[k].startTime);
    evetimes.push(allEvNodes[k].endTime);
  }
  //removes all past events with coupled locations:
  evlocs.splice(0, evlocs.indexOf('NOW') + 1);
  evstimes.splice(0, evstimes.indexOf(currentTime) + 1);
  evetimes.splice(0, evetimes.indexOf('n/a') + 1);
  return { evlocs, evstimes, evetimes };
}

function eventModificationProcess(uid, calEvent, eventData) {
  //we need to set given event. It must be event with its ID
  firebase.database().ref('users/' + uid + '/events/' + calEvent.id).set({
    title: eventData.title,
    description: eventData.description,
    start: eventData.start,
    end: eventData.end,
    id: eventData.id,
    location: eventData.location
  });
  $('#calendar').fullCalendar('updateEvent', calEvent);
  eventRenderer();
  $('#editEvent').modal('hide');
}

function newEventAdditionProcess(uid, eventData) {
  writeNewEvent(uid, eventData.title, eventData.start, eventData.end, eventData.description, eventData.location);
  eventData.id = newEventKey;
  $('#calendar').fullCalendar('renderEvent', eventData, true);
  eventRenderer();
  $('#newEvent').modal('hide');
}

function errData(err){
  console.log("ERROR!" + err);
};

//Update new event function
var writeNewEvent = function(uid, title, start, end, description, location){
  var eventData = {
    title: title,
    start: start,
    end: end,
    description: description,
    location: location
  };
  var newEventKey = firebase.database().ref().child('events').push().key;
  eventData.id = newEventKey;
  var updates = {};
  updates['/users/' + uid + '/events/' + newEventKey] = eventData;
  return firebase.database().ref().update(updates), newEventKey;
};

// here maps geocoding service functions //
function geocodeNext(platform, eventData, calEvent, myPosition, currentTime, uid, startM) {
  var geocoder = platform.getGeocodingService();
  var geocodingParameters = {
    searchText: eventData.location,
    jsonattributes: 1
  };
  geocoder.geocode(geocodingParameters, function(result){
    var nextEventCoords = result.response.view[0].result;
    var waypoint0 = 'geo!'+myPosition.latitude.toString()+','+myPosition.longitude.toString();
    var waypoint1 = 'geo!'+nextEventCoords[0].location.displayPosition.latitude.toString()+','+nextEventCoords[0].location.displayPosition.longitude.toString();
    console.log(waypoint0, waypoint1); //shows lat and long of waypoints as proper strings
    var routingParams = {
      'mode':'fastest;car',
      'waypoint0': waypoint0,
      'waypoint1': waypoint1,
      'representation': 'display',
      'legAttributes': 'travelTime' //duration element
    };
    var myRouter = platform.getRoutingService();
    var timeGap = startM.diff(currentTime, 'seconds');
    validateWithRoutingTime(myRouter, routingParams, startM, currentTime, eventData, uid, calEvent, timeGap);
  }, 
  onError);
};

function geocodeDef(platform, eventNodes, eventData, calEvent, uid, startM){
  //now we need to compare {event[k] start time and location} with {event[k-1] end time and location}
  var fromEventeTime = moment(eventNodes.evetimes[evetimes.indexOf(eventData.end)-1]);
  var toEventsTime = moment(eventNodes.evetimes[evetimes.indexOf(eventData.start)]);
  var timeGap = toEventsTime.diff(fromEventeTime, 'seconds');

  //for geocoding of both events:
  var fromEventLoc = eventNodes.evlocs[evlocs.indexOf(eventData.location)-1];
  var toEventLoc = eventNodes.evlocs[evlocs.indexOf(eventData.location)];
  var fromEvParams = {searchText: fromEventLoc, jsonattributes: 1};
  var toEvParams = {searchText: toEventLoc, jsonattributes: 1};
  var geocoder = platform.getGeocodingService();
  geocoder.geocode(fromEvParams, function(result){
    var prevEventcoords = result.response.view[0].result;
    var waypoint0 = 'geo!'+prevEventcoords[0].location.displayPosition.latitude.toString()+','+prevEventcoords[0].location.displayPosition.longitude.toString();
    geocoder.geocode(toEvParams, function(res){
      var thisEventcoords = res.response.view[0].result;
      var waypoint1 = 'geo!'+thisEventcoords[0].location.displayPosition.latitude.toString()+','+thisEventcoords[0].location.displayPosition.longitude.toString();
      var routingParams = {
        'mode':'fastest;car',
        'waypoint0': waypoint0,
        'waypoint1': waypoint1,
        'representation': 'display',
        'legAttributes': 'travelTime' //duration element
      };
      var myRouter = platform.getRoutingService();
      validateWithRoutingTime(myRouter, routingParams, startM, 0, eventData, uid, calEvent, timeGap);
    }, onError);
  }, onError);
}

function validateWithRoutingTime(myRouter, routingParams, startM, currentTime, eventData, uid, calEvent, timeGap) {
  myRouter.calculateRoute(routingParams, function (result) {
    var traveltime = result.response.route[0].leg[0].travelTime; //in seconds apparently
    console.log(traveltime, startM, currentTime, timeGap);
    //now we compare the time gap available with the travel time to get to the appointment:
    if (timeGap + 300 - 3600 > traveltime) { //if the time gap with a clearance of 5 minutes is more than the travel time then:
      //register event like before
      if (eventData.id == null || eventData.id == undefined) {
        newEventAdditionProcess(uid, eventData);
      }
      else {
        eventModificationProcess(uid, calEvent, eventData);
      }
    }
    else {
      alert("ERROR: you don't have enough time to get there!");
    }
  }, function (err) { alert(err.message); });
}

function onError(error) {
  alert(error + ": geocoding service error");
};