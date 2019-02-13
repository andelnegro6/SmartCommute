'use strict';

$(document).ready(function () {
  var newEventKey;

  //fullCalendar configuration:
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
      var endDate = startDate;
      var fechaInicio = new Date(startDate);
      //var fstringInicio = $.fullCalendar.formatDate(fechaInicio, 'yyyy-MM-dd');
      var inicio = startDate.format();
      //var fstringFin = fstringInicio;
      var fin = inicio;
      newEvent(inicio, fin); //pass in 'YYYY-MM-dd' formats
    },

    eventClick: function eventClick(calEvent, jsEvent, view) {
      editEvent(calEvent);
      //console.log(calEvent); //each event's ID is shown! good.
    },
    //Modify the event adding a new element and generate a pop over of title and description
    eventRender: function eventRender(eventObj, $el) {
      var inizio = eventObj.start.format().slice(12, 16);
      var fine = eventObj.end.format().slice(12, 16);
      $el.addClass(eventObj.description);
      $el.popover({
        title: eventObj.title,
        content: "start time: " + inizio + ", end time: " + fine,
        trigger: 'hover',
        placement: 'top',
        container: 'body'
      });
    },

    eventSources: ['src/scripts/events.js', 'src/scripts/settings.js']
    //events loads the previously saved events, settings loads the user's settings
  });
  //------------------------------------------------------------------------------

  //Update new event function
  var writeNewEvent = function writeNewEvent(uid, title, description, start, end) {
    var eventData = {
      title: title,
      start: start,
      end: end,
      description: description
    };

    newEventKey = firebase.database().ref().child('events').push().key;
    eventData.id = newEventKey;
    var updates = {};

    updates['/users/' + uid + '/events/' + newEventKey] = eventData;
    return firebase.database().ref().update(updates), newEventKey;
  };

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
      var startToParse = start + " " + stiempo + " Z";
      var endToParse = end + " " + etiempo + " Z";
      var startParsed = Date.parse(startToParse);
      var endParsed = Date.parse(endToParse);
      //console.log(endToParse, endParsed, startToParse, startParsed);

      var eventData = {
        title: title,
        start: start + "T" + stiempo + ":00.000Z",
        end: end + "T" + etiempo + ":00.000Z",
        description: comentario
      };

      var isValid = validateEvents(uid, startParsed, endParsed);

      if (title && isValid) {
        var eventData = {
          title: title,
          start: start + "T" + stiempo + ":00.000Z",
          end: end + "T" + etiempo + ":00.000Z",
          description: comentario
        };

        writeNewEvent(uid, eventData.title, eventData.description, eventData.start, eventData.end);
        eventData.id = newEventKey; //appends the id generated from DB to the event
        console.log(eventData);

        //renders event onto calendar with ID generated from firebase DB
        $('#calendar').fullCalendar('renderEvent', eventData, true);
        eventRenderer();
        $('#newEvent').modal('hide');
      } else {
        alert("Title is blank or date is incorrect. Try again.");
      }
    });
    // @TODO TO HERE IS NEW EVENT
  };

  //Edit an event:
  var editEvent = function editEvent(calEvent, jsEvent, view) {
    console.log(calEvent.start, calEvent.end);
    $('#editSelected').text('Selected days: ' + calEvent.start.format().split('T', 1) + ' to ' + calEvent.end.format().split('T', 1));
    $('input#editTitle').val(calEvent.title);
    $('textarea#editinfo_description').val(calEvent.description);

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

      var user = firebase.auth().currentUser;
      var name, email, uid, emailVerified;
      if (user != null) {
        name = user.displayName;
        email = user.email;
        emailVerified = user.emailVerified;
        uid = user.uid; //the important one here
      }

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

      if (title && endParsed - startParsed > 0) {
        calEvent.description = comentario;
        calEvent.title = title;
        calEvent.start = f_inicio + "T" + stiempo + ":00.000Z";
        calEvent.end = f_fin + "T" + etiempo + ":00.000Z";

        var eventData = {
          title: title,
          start: f_inicio + "T" + stiempo + ":00.000Z",
          end: f_fin + "T" + etiempo + ":00.000Z",
          description: comentario,
          id: calEvent.id
        };

        $('#calendar').fullCalendar('updateEvent', calEvent);
        eventRenderer();
        $('#editEvent').modal('hide');

        //we need to set given event. It must be event with its ID
        firebase.database().ref('users/' + uid + '/events/' + calEvent.id).set({
          title: eventData.title,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end,
          id: eventData.id
        });
      } else {
        alert("Title is blank or date is incorrect. Try again.");
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

function validateEvents(uid, start, end, eventData) {
  if (end - start < 0) {
    return false;
  }
  var isValid = isNotColliding(uid, start, end, eventData);
  return isValid;
}

function isNotColliding(uid, start, end, eventData) {
  var waiting = true;
  var response = true;
  firebase.database().ref('users/' + uid + "/events/").once('value', function gotData(data) {
    var datas = data.toJSON();
    for (var i in datas) {
      var value = datas[i];
      var eventsStart = Date.parse(value.start);
      var eventsEnd = Date.parse(value.end);
      //console.log(typeof eventsStart, typeof eventsEnd);
      if (eventsStart < end && eventsEnd > start) {
        response = false;
        // break;
      }
    }
    // writeNewEvent(uid, eventData.title, eventData.description, eventData.start, eventData.end);
    // eventData.id = newEventKey; //appends the id generated from DB to the event
    // console.log(eventData);
    waiting = false;
  }, errData);
  while (waiting) {}
  return response;
}

function errData(err) {
  console.log("ERROR!" + err);
}