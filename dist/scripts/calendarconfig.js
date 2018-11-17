'use strict';

$(function () {
  loadEvents();
  showTodaysDate();
  initializeCalendar();
  getCalendars();
  initializeRightCalendar();
  initializeLeftCalendar();
  disableEnter();
});

/*--------------------------calendar variables--------------------------*/
var getCalendars = function getCalendars() {
  $cal = $('.calendar');
  $cal1 = $('#calendar1');
  $cal2 = $('#calendar2');
};

$(function () {

  // page is now ready, initialize the calendar...

  $('#calendar1').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek'
    },
    navLinks: false,
    dayClick: function dayClick(date) {
      cal2GoTo(date);
    },
    eventClick: function eventClick(calEvent) {
      cal2GoTo(calEvent.start);
    }
    // put your options and callbacks here
  });
  //var CLIENT_ID = '1011415575967-h2vmrbtacsslcv3n38fqrnerjbo5plio.apps.googleusercontent.com';
  // CLIENT SECRET: WEs0Py3OQ6N1P1Gxrx1y-Fm4
});

$(function () {

  // page is now ready, initialize the calendar...

  var initializeRightCalendar = $('#calendar2').fullCalendar({
    defaultView: 'agendaDay',
    header: {
      right: 'prev,next today'
    },
    selectable: true, //can select more than one day
    selectHelper: true, //can drag mouse to select multiple days at a time
    editable: true, //allows to makes changes to the calendar
    eventLimit: true, //limits the events to show per day if exceed the available space on the cell

    select: function select(start, end) {
      newEvent(start);
    },
    eventClick: function eventClick(calEvent, jsEvent, view) {
      editEvent(calEvent);
    }
    // put your options and callbacks here
  });
  //var CLIENT_ID = '1011415575967-h2vmrbtacsslcv3n38fqrnerjbo5plio.apps.googleusercontent.com';
  // CLIENT SECRET: WEs0Py3OQ6N1P1Gxrx1y-Fm4
});