'use strict';

$(document).ready(function () {

  // page is now ready, initialize the calendar...

  $('#calendar').fullCalendar({

    // put your options and callbacks here
    dayClick: function dayClick() {
      alert('a day has been clicked!');
    }
  });
});