'use strict';

$(document).ready(function () {
  var inicio = '';
  var fin = '';

  //fullCalendar configuration:
  $('#calendar').fullCalendar({
    header: {
      left: 'today prev,next',
      center: 'title',
      right: 'timelineDay,timelineThreeDays,agendaWeek,month,listWeek'
    },

    slotEventOverlap: false,
    allDay: true,
    selectable: true,
    selectHelper: true,
    defaultView: 'listWeek',
    navLinks: true, // can click day/week names to navigate views
    editable: false,
    eventLimit: true, // allow "more" link when too many events
    timezone: 'America/Chicago',

    select: function select(startDate, endDate) {
      inicio = startDate.format();
      fin = endDate.format();
      newEvent(startDate);
    },

    eventClick: function eventClick(calEvent, jsEvent, view) {
      editEvent(calEvent);
    },

    //Modify the event adding a new element and generate a pop over of title and description
    eventRender: function eventRender(eventObj, $el) {
      $el.addClass(eventObj.description);
      $el.popover({
        title: eventObj.title,
        content: eventObj.description,
        trigger: 'hover',
        placement: 'top',
        container: 'body'
      });
    },

    //Config defaut events as a function
    events: events()
  });
  //------------------------------------------------------------------------------

  //Load events from the file events.js
  var loadEvents = function loadEvents() {
    $.getScript("scripts/events.js", function () {});
  };

  //Create a newEvent
  var newEvent = function newEvent(startDate) {
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
      /*----------------------------------------------------------------------- */
      //parse date format into a string for the json:
      var Fecha = new Date(fin);

      //Fecha.setDate(Fecha.getDate());
      var ano = Fecha.getUTCFullYear();
      var mes = Fecha.getUTCMonth() + 1;
      var dia = Fecha.getUTCDate() - 1;
      var dia2 = '';
      var mes2 = '';

      if (mes.toString().length < 2) {
        mes2 = '0' + mes.toString();
      } else {
        mes2 = mes.toString();
      }

      if (dia.toString().length < 2) {
        dia2 = '0' + dia.toString();
      } else {
        dia2 = dia.toString();
      }

      //formato de salida para la fecha
      var fin2 = ano.toString() + '-' + mes2 + '-' + dia2;
      //var fin2 = Fechachan.toString("YYYY-MM-DD");

      if (title) {
        var eventData = {
          title: title,
          start: inicio + "T" + stiempo + ":00.000Z",
          end: fin2 + "T" + etiempo + ":00.000Z",
          description: comentario
        };

        $('#calendar').fullCalendar('renderEvent', eventData, true);
        $('#newEvent').modal('hide');

        //sends data to travlendar database:
        firebase.database().ref('users/' + uid).set({
          //id: id,
          title: eventData.title,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end
        });

        console.log(eventData);
      } else {
        alert("Title can't be blank. Please try again.");
      }
    });
  };

  //Edit an event:
  var editEvent = function editEvent(calEvent) {
    $('input#editTitle').val(calEvent.title);
    $('textarea#editinfo_description').val(calEvent.description);

    $('#editEvent').modal('show');
    $('#update').unbind();

    $('#update').on('click', function () {
      var title = $('input#editTitle').val();
      var comentario = $('textarea#editinfo_description').val();
      var stiempo = $('input#stime').val();
      var etiempo = $('input#etime').val();

      $('#editEvent').modal('hide');
      var eventData;

      if (title) {
        calEvent.description = comentario;
        calEvent.title = title;

        $('#calendar').fullCalendar('updateEvent', calEvent);
      } else {
        alert("Title can't be blank. Please try again.");
      }
    });

    $('#delete').on('click', function () {

      $('#delete').unbind();
      if (calEvent._id.includes("_fc")) {
        $('#calendar').fullCalendar('removeEvents', [getCal1Id(calEvent._id)]);
        $('#calendar').fullCalendar('removeEvents', [calEvent._id]);
      } else {
        $('#calendar').fullCalendar('removeEvents', [calEvent._id]);
      }

      $('#editEvent').modal('hide');
    });
  };
});

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

//function that writes data to the realtime database:
//we insert the current user's id to call the .ref method of the DB and set the event data!
function writeUserData(userId, name, email) {
  firebase.database().ref('users/' + userId).set({
    //id: id,
    title: eventData.title,
    description: eventData.description,
    start: eventData.start,
    end: eventData.end
  });
}

//$(function() {
//   // loadEvents();
//   // saveEvent();

//   });