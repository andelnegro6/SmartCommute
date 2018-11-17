'use strict';

$(function () {
  loadEvents();
  saveEvent();
});
/* --------------------------calendar-------------------------- */
$(document).ready(function () {
  var inicio = '';
  var fin = '';
  /* --------------------------Config Calendar-------------------------- */
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

    /* -----Modify the event adding a new element and generate a pop over of title and description--- */

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

    /* --------------------------Config defaut events as a function-------------------------- */

    events: events()
  });
  /* --------------------------Load events from the file events.js-------------------------- */

  var loadEvents = function loadEvents() {
    $.getScript("scripts/events.js", function () {});
  };

  /* --------------------------Create a newEvent-------------------------- */
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
      } else {
        alert("Title can't be blank. Please try again.");
      }
    });
  };
  /* --------------------------Edit an Event-------------------------- */

  var editEvent = function editEvent(calEvent) {
    $('input#editTitle').val(calEvent.title);
    $('textarea#editinfo_description').val(calEvent.description);

    $('#editEvent').modal('show');
    $('#update').unbind();

    $('#update').on('click', function () {
      var title = $('input#editTitle').val();
      var comentario = $('textarea#editinfo_description').val();
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