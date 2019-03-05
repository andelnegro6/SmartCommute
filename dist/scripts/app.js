'use strict';

// import {myPlatform} from '../../main.html'
$(document).ready(function () {

  $('#calendar').fullCalendar({
    header: {
      left: 'today prev,next',
      center: 'title',
      right: 'timelineDay,timelineThreeDays,agendaWeek,month,listWeek'
    },
    eventOverlap: false,
    slotEventOverlap: false,
    allDay: true,
    selectable: true,
    selectHelper: true,
    defaultView: 'month',
    navLinks: true, // can click day/week names to navigate views
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    timezone: 'America/Chicago',

    select: function select(startDate, endDate) {
      //triggered once several days are selected
      console.log(startDate, endDate);
      var inicio = startDate.format();
      var fin = endDate.format();
      var finDate = new Date(endDate);
      var endDay = finDate.getUTCDate() - 1; //correct day as an integer
      var endDay2digits = '';
      if (endDay.toString().length < 2) {
        endDay2digits = '0' + endDay.toString();
      } else {
        endDay2digits = endDay.toString();
      }
      var fin2 = fin.substr(0, 8); //'YYYY-MM-'
      var fin3 = ''.concat(fin2 + endDay2digits); //'YYYY-MM-dd'
      newEvent(inicio, fin3);
    },

    dayClick: function dayClick(startDate) {
      //triggered once a day is clicked
      // var endDate = startDate;
      var inicio = startDate.format();
      var fin = inicio;
      newEvent(inicio, fin); //pass in 'YYYY-MM-dd' formats
    },

    eventClick: function eventClick(calEvent, jsEvent, view) {
      editEvent(calEvent);
      //console.log(calEvent); 
    },
    //Modify the event adding a new element and generate a pop over of title and description
    eventRender: function eventRender(eventObj, $el) {
      if (eventObj.start != null || eventObj.end != null) {
        var inizio = eventObj.start.format().slice(11, 16);
        var fine = eventObj.end.format().slice(11, 16);
        var content = "start time: " + inizio + ", end time: " + fine;
      } else {
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
    //events loads the previously saved events, settings loads the user's settings
    eventSources: ['src/scripts/events.js', 'src/scripts/settings.js']
  });
  //------------------------------------------------------------------------------

  var fixTo2Digits = function fixTo2Digits(digits) {
    var fixedDigits;
    if (digits.length < 2) {
      fixedDigits = '0' + digits;
    } else {
      fixedDigits = digits;
    };
    return fixedDigits;
  };

  //Create a newEvent
  var newEvent = function newEvent(start, end) {
    $('#selected').text('selected days: ' + start + ' to ' + end); //shows on modal the selected date
    $('input#title').val("");
    $('textarea#info_description').val("");
    $('#newEvent').modal('show');
    $('#submit').unbind();

    $('#submit').on('click', function () {
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
      /*----------------------------------------------------------------------- */
      var eventData = {
        title: title,
        start: start + "T" + stiempo + ":00+01:00",
        end: end + "T" + etiempo + ":00+01:00",
        description: comentario,
        location: location
      };
      if (title) {
        validateEvents(uid, eventData);
      } else {
        alert("please insert a title");
      }
    });
  };

  //Edit an event:
  var editEvent = function editEvent(calEvent, jsEvent, view) {
    console.log(calEvent.start, calEvent.end);
    $('#editSelected').text('Selected days: ' + calEvent.start.format().split('T', 1) + ' to ' + calEvent.end.format().split('T', 1));
    $('input#editTitle').val(calEvent.title);
    $('textarea#editinfo_description').val(calEvent.description);
    $('input#editEventLocation').val(calEvent.location);

    //extracts hours and minutes from calEvent (saved event) ONLY to show on modal:
    var updstHours = (calEvent.start._d.getHours() - 1).toString();
    var updstMins = calEvent.start._d.getMinutes().toString();
    var updeHours = (calEvent.end._d.getHours() - 1).toString();
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

    $('#update').on('click', function () {
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

      if (title) {
        calEvent.description = comentario;
        calEvent.title = title;
        calEvent.start = f_inicio + "T" + stiempo + ":00+01:00";
        calEvent.end = f_fin + "T" + etiempo + ":00+01:00";
        calEvent.location = location;

        var eventData = {
          title: title,
          start: f_inicio + "T" + stiempo + ":00+01:00",
          end: f_fin + "T" + etiempo + ":00+01:00",
          description: comentario,
          location: location,
          id: calEvent.id
        };

        validateEvents(uid, eventData, calEvent);
      } else {
        alert("Title is blank. Try again.");
      }
    });

    //delete event
    $('#delete').on('click', function () {
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
  };
});
var newEventKey;

var eventRenderer = function eventRenderer() {
  $('#calendar').fullCalendar('removeEvents');
  events();
};
/* --------------------------Others-------------------------- */
var getCal1Id = function getCal1Id(cal2Id) {
  var num = cal2Id.replace('_fc', '') - 1;
  var id = "_fc" + num;
  return id;
};
/* --------------------------others-------------------------- */
var disableEnter = function disableEnter() {
  $('body').bind("keypress", function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      return false;
    }
  });
};

function allEventsOk(everyVal) {
  return everyVal > 0;
}

function validateEvents(uid, eventData, calEvent) {
  var start = Date.parse(eventData.start);
  var end = Date.parse(eventData.end);
  if (end - start < 0 && eventData.title) {
    //step to verify no wrong time values (if start comes after the end)
    alert("event times are invalid. Please correct");
  } else {
    isNotColliding(uid, eventData, calEvent);
  }
}

function isNotColliding(uid, eventData, calEvent) {
  firebase.database().ref('users/' + uid + "/events/").once('value').then(function (data) {
    var datas = data.toJSON();
    var allVals = new Array();
    var allEvNodes = new Array();
    var startM = moment(eventData.start).local(); //IS GIVING ME ONE HOUR EXTRA FFFFFU
    var endM = moment(eventData.end).local();
    //node information of event to be created:
    allEvNodes.push({ 'startTime': startM, 'endTime': endM, 'location': eventData.location });
    for (var i in datas) {
      var value = datas[i];
      var eventsStart = moment(value.start);
      var eventsEnd = moment(value.end);
      if (eventsStart < endM && eventsEnd > startM) {
        allVals.push(0);
      } else {
        allVals.push(1);
        //puts all non-colliding event start and locs in array:
        allEvNodes.push({ 'startTime': eventsStart, 'endTime': eventsEnd, 'location': value.location });
      }
    }
    if (eventData.id != null || eventData.id != undefined) {
      allVals.pop(); //pops out the element correspondent to the current event data (to prevent self-comparison)
    }
    if (allVals.every(allEventsOk)) {
      //if no other event overlaps
      var currentTime = moment();
      if (currentTime - startM >= 0) {
        //if event has passed 
        if (eventData.id == null || eventData.id == undefined) {
          //if event is new so there's no event id:
          newEventAdditionProcess(uid, eventData);
        } else {
          //if event exists therefore id is existent:        
          eventModificationProcess(uid, calEvent, eventData);
        }
      } else {
        //if event is yet to happen, first must check if it's the next event or not
        var _generateNodes = generateNodes(allEvNodes, currentTime),
            evlocs = _generateNodes.evlocs,
            evstimes = _generateNodes.evstimes,
            evetimes = _generateNodes.evetimes;

        var eventNodes = { evlocs: evlocs, evstimes: evstimes, evetimes: evetimes };
        console.log(eventNodes); //these are the event nodes.
        //events locations and times now ordered and only upcoming ones are present
        var myPlatform = new H.service.Platform({
          'app_id': 'SKrth5W6mIRCcxVYfDWi',
          'app_code': 'bW5PezhhynKJWF85-sSZlA'
        });
        if (eventNodes.evlocs[0] == eventData.location && eventNodes.evstimes[0] == startM) {
          //if the event to be created is next event:
          navigator.geolocation.getCurrentPosition(function (pos) {
            var myPosCoords = pos.coords;
            geocodeNext(myPlatform, eventData, calEvent, uid, startM, endM, eventNodes, myPosCoords, currentTime);
          });
        } else {
          //if the event happens after one or more upcoming existing events:
          geocodeDef(myPlatform, eventData, calEvent, uid, startM, endM, eventNodes);
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
  allEvNodes.sort(function (a, b) {
    return a.startTime - b.startTime;
  }); //sort start times in ascending order allEvTimes[0] is most recent start time
  console.log(allEvNodes); //events organized
  for (var k = 0; k < allEvNodes.length; k++) {
    //events separated
    evlocs.push(allEvNodes[k].location);
    evstimes.push(allEvNodes[k].startTime);
    evetimes.push(allEvNodes[k].endTime);
  }
  //removes all past events with coupled locations:
  evlocs.splice(0, evlocs.indexOf('NOW') + 1);
  evstimes.splice(0, evstimes.indexOf(currentTime) + 1);
  evetimes.splice(0, evetimes.indexOf('n/a') + 1);
  return { evlocs: evlocs, evstimes: evstimes, evetimes: evetimes };
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

function errData(err) {
  console.log("ERROR!" + err);
};

//Update new event function
var writeNewEvent = function writeNewEvent(uid, title, start, end, description, location) {
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

// here maps geocoding service functions
function geocodeNext(platform, eventData, calEvent, uid, startM, endM, eventNodes, myPosition, currentTime) {
  var evKplu1_sTime = eventNodes.evstimes[eventNodes.evstimes.indexOf(startM) + 1];
  var timeGapPre = startM.diff(currentTime, 'seconds');
  if (evKplu1_sTime != undefined) {
    var timeGapPost = evKplu1_sTime.diff(endM, 'seconds');
  } else {
    var timeGapPost = 0;
  };
  var timegaps = { timeGapPre: timeGapPre, timeGapPost: timeGapPost };

  var nxtEventLoc = eventNodes.evlocs[eventNodes.evstimes.indexOf(startM) + 1];
  var geocoder = platform.getGeocodingService();
  var curEventGeoParams = { searchText: eventData.location, jsonattributes: 1 };
  var nxtEventGeoParams = { searchText: nxtEventLoc, jsonattributes: 1 };
  geocoder.geocode(curEventGeoParams, function (curResult) {
    var curEventCoords = curResult.response.view[0].result;
    geocoder.geocode(nxtEventGeoParams, function (nxtResult) {
      var waypoint0 = 'geo!' + myPosition.latitude.toString() + ',' + myPosition.longitude.toString();
      var waypoint1 = 'geo!' + curEventCoords[0].location.displayPosition.latitude.toString() + ',' + curEventCoords[0].location.displayPosition.longitude.toString();
      console.log(waypoint0, waypoint1, waypoint2); //shows lat and long of waypoints as proper strings
      var routeToEventParams = {
        'mode': 'fastest;car',
        'waypoint0': waypoint0,
        'waypoint1': waypoint1,
        'representation': 'display',
        'legAttributes': 'travelTime' //duration element
      };
      if (nxtResult.response != undefined) {
        // if there's an event after the one to be created:
        var nxtEventCoords = nxtResult.response.view[0].result;
        var waypoint2 = 'geo!' + nxtEventCoords[0].location.displayPosition.latitude.toString() + ',' + nxtEventCoords[0].location.displayPosition.longitude.toString();
        var routeToNxtEventParams = {
          'mode': 'fastest;car',
          'waypoint0': waypoint1,
          'waypoint1': waypoint2,
          'representation': 'display',
          'legAttributes': 'travelTime' //duration element
        };
        var routeCalcs = { routeToEventParams: routeToEventParams, routeToNxtEventParams: routeToNxtEventParams };
      } else {
        //if there's no event after the one to be created:
        var routeCalcs = { routeToEventParams: routeToEventParams, 'routeToNxtEventParams': null };
      }
      validateWithRoutingTime(platform, routeCalcs, eventData, uid, calEvent, timegaps);
    }, onError);
  }, onError);
};

function geocodeDef(platform, eventData, calEvent, uid, startM, endM, eventNodes) {
  //now we need to compare event[k] start time and location} with {event[k-1] end time and location
  var evKmin1_eTime = eventNodes.evetimes[eventNodes.evetimes.indexOf(endM) - 1];
  var evK_sTime = eventNodes.evstimes[eventNodes.evstimes.indexOf(startM)];
  var evK_eTime = eventNodes.evetimes[eventNodes.evetimes.indexOf(endM)];
  var evKplu1_sTime = eventNodes.evstimes[eventNodes.evstimes.indexOf(startM) + 1];

  console.log(eventNodes.evetimes, eventNodes.evstimes);
  console.log(evK_sTime, evKmin1_eTime);
  console.log(eventData.start, eventData.end);

  if (evKplu1_sTime != undefined) {
    //if event isn't the farthest in time
    //gap of time between the next event start and the end of event to be created: 
    var timeGapPost = evKplu1_sTime.diff(evK_eTime, 'seconds');
  } else {
    var timeGapPost = 0;
  };
  //gap of time between the previous event end and the start of event to be created:
  var timeGapPre = evK_sTime.diff(evKmin1_eTime, 'seconds');
  var timegaps = { timeGapPre: timeGapPre, timeGapPost: timeGapPost };

  //for geocoding of both events:
  var fromEventLoc = eventNodes.evlocs[eventNodes.evstimes.indexOf(startM) - 1];
  var toEventLoc = eventNodes.evlocs[eventNodes.evstimes.indexOf(startM)];
  var nxtEventLoc = eventNodes.evlocs[eventNodes.evstimes.indexOf(startM) + 1];

  //locations of event k-1, k and k+1 to calculate prev and next routes:
  var fromEvParams = { searchText: fromEventLoc, jsonattributes: 1 };
  var toEvParams = { searchText: toEventLoc, jsonattributes: 1 };
  var nxtEventParams = { searchText: nxtEventLoc, jsonattributes: 1 };

  var geocoder = platform.getGeocodingService();
  geocoder.geocode(fromEvParams, function (frmResult) {
    var prevEventcoords = frmResult.response.view[0].result;
    geocoder.geocode(toEvParams, function (toResult) {
      var thisEventcoords = toResult.response.view[0].result;
      geocoder.geocode(nxtEventParams, function (nxtResult) {
        //obtains the coordinates of all the places needed for event validation
        var waypoint0 = 'geo!' + prevEventcoords[0].location.displayPosition.latitude.toString() + ',' + prevEventcoords[0].location.displayPosition.longitude.toString();
        var waypoint1 = 'geo!' + thisEventcoords[0].location.displayPosition.latitude.toString() + ',' + thisEventcoords[0].location.displayPosition.longitude.toString();
        var routeToEventParams = { //route request from prev event to current event
          'mode': 'fastest;car',
          'waypoint0': waypoint0,
          'waypoint1': waypoint1,
          'representation': 'display',
          'legAttributes': 'travelTime' //duration element
        };
        if (nxtResult.response != undefined) {
          var nextEventcoords = nxtResult.response.view[0].result;
          var waypoint2 = 'geo!' + nextEventcoords[0].location.displayPosition.latitude.toString() + ',' + nextEventcoords[0].location.displayPosition.longitude.toString();
          var routeToNxtEventParams = { //route request from current event to following event (if any)
            'mode': 'fastest;car',
            'waypoint0': waypoint1,
            'waypoint1': waypoint2,
            'representation': 'display',
            'legAttributes': 'travelTime' //duration element
          };
          var routeCalcs = { routeToEventParams: routeToEventParams, routeToNxtEventParams: routeToNxtEventParams };
        } else {
          var routeCalcs = { routeToEventParams: routeToEventParams, 'routeToNxtEventParams': null };
        }
        validateWithRoutingTime(platform, routeCalcs, eventData, uid, calEvent, timegaps);
      }, onError);
    }, onError);
  }, onError);
}

function validateWithRoutingTime(platform, routingParams, eventData, uid, calEvent, timegaps) {
  var myRouter = platform.getRoutingService();
  myRouter.calculateRoute(routingParams.routeToEventParams, function (toResult) {
    var trTimeToEvent = toResult.response.route[0].leg[0].travelTime; //in seconds
    if (routingParams['routeToNxtEventParams'] != null) {
      myRouter.calculateRoute(routingParams.routeToNxtEventParams, function (nxtResult) {
        var trTimeToNxtEvent = nxtResult.response.route[0].leg[0].travelTime;
        console.log(trTimeToEvent, trTimeToNxtEvent, timegaps);
        //now we compare the time gaps available with the travel time to get to the appointment:
        if (timegaps.timeGapPre + 300 > trTimeToEvent && timegaps.timeGapPost + 300 > trTimeToNxtEvent) {
          //if the time gap with a clearance of 5 minutes is more than the travel time
          //BOTH FOR the travel to get there and what it would take to get to the next event, then:
          //register event like before
          if (eventData.id == null || eventData.id == undefined) {
            newEventAdditionProcess(uid, eventData);
          } else {
            eventModificationProcess(uid, calEvent, eventData);
          }
        } else {
          alert("ERROR: you're either short on time to get there or you'd be unable to get to the following appointment!");
        }
      }, function (err) {
        alert(err.message);
      });
    } else {
      if (timegaps.timeGapPre + 300 > trTimeToEvent) {
        if (eventData.id == null || eventData.id == undefined) {
          newEventAdditionProcess(uid, eventData);
        } else {
          eventModificationProcess(uid, calEvent, eventData);
        }
      }
    }
  }, function (err) {
    alert(err.message);
  });
};

function onError(error) {
  alert(error + ": geocoding service error");
};