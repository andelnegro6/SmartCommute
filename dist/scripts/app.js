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
      // console.log(inicio, typeof inicio, fin, typeof fin); //fin throws wrong day
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
      var dia = Fecha.getUTCDate();
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

        // console.log(eventData);
      } else {
        alert("Title can't be blank. Please try again.");
      }
    });
  };

  //Edit an event:
  var editEvent = function editEvent(calEvent) {
    $('input#editTitle').val(calEvent.title);
    $('textarea#editinfo_description').val(calEvent.description);

    //extracts hours and minutes from calEvent (saved event):
    var updstHours = (calEvent.start._d.getHours() - 1).toString();
    var updstMins = calEvent.start._d.getMinutes().toString();
    var updeHours = (calEvent.end._d.getHours() - 1).toString();
    var updeMins = calEvent.end._d.getMinutes().toString();

    $('input#editstime').val(updstHours + ":" + updstMins);
    $('input#editetime').val(updeHours + ":" + updeMins);
    $('#editEvent').modal('show');
    $('#update').unbind();

    console.log('hola asfefesss');
    //DATE FORMATS (SUN 4 NOV 2018 yadayadayada)

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
        uid = user.uid;
      }

      var ano_s = calEvent.start._d.getUTCFullYear().toString();
      var mes_s = (calEvent.start._d.getUTCMonth() + 1).toString();
      var dia_s = calEvent.start._d.getUTCDate().toString();
      var ano_e = calEvent.end._d.getUTCFullYear().toString();
      var mes_e = (calEvent.end._d.getUTCMonth() + 1).toString();
      var dia_e = (calEvent.end._d.getUTCDate() - 1).toString();

      if (dia_s.length < 2) {
        dia_s = '0' + dia_s;
      } else {
        dia_s = dia_s;
      }

      if (mes_s.length < 2) {
        mes_s = '0' + mes_s;
      } else {
        mes_s = mes_s;
      }

      if (dia_e.length < 2) {
        dia_e = '0' + dia_e;
      } else {
        dia_e = dia_e;
      }

      if (mes_e.length < 2) {
        mes_e = '0' + mes_e;
      } else {
        mes_e = mes_e;
      }

      var f_inicio = ano_s + '-' + mes_s + '-' + dia_s;
      var f_fin = ano_e + '-' + mes_e + '-' + dia_e;
      console.log(f_inicio, f_fin);

      if (title) {
        calEvent.description = comentario;
        calEvent.title = title;
        calEvent.start = '';
        calEvent.end = '';

        var eventData = {
          title: title,
          start: f_inicio + "T" + stiempo + ":00.000Z",
          end: f_fin + "T" + etiempo + ":00.000Z",
          description: comentario
        };

        $('#calendar').fullCalendar('updateEvent', calEvent);
        $('#editEvent').modal('hide');

        firebase.database().ref('users/' + uid).set({
          //id: id,
          title: eventData.title,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end
        });
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