$( document ).ready(function() {

  // page is now ready, initialize the calendar...

  $('#calendar').fullCalendar({

    // put your options and callbacks here
    dayClick: function() {
      alert('a day has been clicked!');
    }
  })

});
