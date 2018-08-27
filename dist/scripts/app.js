'use strict';

$(document).ready(function () {

  $('#calendar').fullCalendar({

    // put your options and callbacks here
    dayClick: function dayClick() {
      alert('a day has been clicked!');
    }
  });
});