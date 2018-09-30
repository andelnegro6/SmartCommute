$(function() {

  // page is now ready, initialize the calendar...
  
  $('#calendar').fullCalendar({
    googleCalendarApiKey: 'AIzaSyCTMsuB2i1s8bhef1hANPUHQDsW00CuCGY',
    events: {
      googleCalendarId: 'u5j2jgvvosnlpej89pr54lb7q8@group.calendar.google.com',
      className: 'gcal-event'
    },  //the events parameter receives data from the gcal ID stated within the events object, and puts it in the fullcalendar layout.
    header: {
      left: 'prev,next today myCustomButton',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    selectable: true,   //can select more than one day 
    selectHelper: true, //can drag mouse to select multiple days at a time
    editable: true,     //allows to makes changes to the calendar
    eventLimit: true,   //limits the events to show per day if exceed the available space on the cell

    dayClick: function() {
      alert('a day has been clicked!');
    }
    // put your options and callbacks here
  });
  //var CLIENT_ID = '1011415575967-h2vmrbtacsslcv3n38fqrnerjbo5plio.apps.googleusercontent.com';
  // CLIENT SECRET: WEs0Py3OQ6N1P1Gxrx1y-Fm4
});