$( document ).ready(function() {


  $('#calendar').fullCalendar({

    // put your options and callbacks here
    dayClick: function() {
      alert('a day has been clicked!');
    }
  })
});
