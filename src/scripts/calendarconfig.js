$(function() {
  loadEvents();
  showTodaysDate();
  initializeCalendar();
  getCalendars();
  initializeRightCalendar();
  initializeLeftCalendar();
  disableEnter();
});

/* --------------------------initialize calendar-------------------------- */
var initializeCalendar = function() {
  $('.calendar').fullCalendar({
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      // create events
      events: events(),
      defaultTimedEventDuration: '00:30:00',
      forceEventDuration: true,
      eventBackgroundColor: '#337ab7',
      editable: false,
      height: screen.height - 160,
      timezone: 'America/Chicago',
    });
}

/*--------------------------calendar variables--------------------------*/
var getCalendars = function() {
  $cal = $('.calendar');
  $cal1 = $('#calendar1');
  $cal2 = $('#calendar2');
}

/* -------------------manage cal2 (right pane)------------------- */
var initializeRightCalendar = function()  {
  $cal2.fullCalendar('changeView', 'agendaDay');

  $cal2.fullCalendar('option', {
    slotEventOverlap: false,
    allDaySlot: false,
    header: {
      right: 'prev,next today'
    },
    selectable: true,
    selectHelper: true,
    select: function(start, end) {
        newEvent(start);
    },
    eventClick: function(calEvent, jsEvent, view) {
        editEvent(calEvent);
    },
  });
}

/* -------------------manage cal1 (left pane)------------------- */
var initializeLeftCalendar = function() {
  $cal1.fullCalendar('option', {
      header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek'
      },
      navLinks: false,
      dayClick: function(date) {
          cal2GoTo(date);
      },
      eventClick: function(calEvent) {
          cal2GoTo(calEvent.start);
      }
  });
}

/* -------------------moves right pane to date------------------- */
var cal2GoTo = function(date) {
  $cal2.fullCalendar('gotoDate', date);
}


var loadEvents = function() {
  $.getScript("js/events.js", function(){
  });
}


var newEvent = function(start) {
  $('input#title').val("");
  $('#newEvent').modal('show');
  $('#submit').unbind();
  $('#submit').on('click', function() {
  var title = $('input#title').val();
  if (title) {
    var eventData = {
        title: title,
        start: start
    };
    $cal.fullCalendar('renderEvent', eventData, true);
    $('#newEvent').modal('hide');
    }
  else {
    alert("Title can't be blank. Please try again.")
  }
  });
}

var editEvent = function(calEvent) {
  $('input#editTitle').val(calEvent.title);
  $('#editEvent').modal('show');
  $('#update').unbind();
  $('#update').on('click', function() {
    var title = $('input#editTitle').val();
    $('#editEvent').modal('hide');
    var eventData;
    if (title) {
      calEvent.title = title
      $cal.fullCalendar('updateEvent', calEvent);
    } else {
    alert("Title can't be blank. Please try again.")
    }
  });
  $('#delete').on('click', function() {
    $('#delete').unbind();
    if (calEvent._id.includes("_fc")){
      $cal1.fullCalendar('removeEvents', [getCal1Id(calEvent._id)]);
      $cal2.fullCalendar('removeEvents', [calEvent._id]);
    } else {
      $cal.fullCalendar('removeEvents', [calEvent._id]);
    }
    $('#editEvent').modal('hide');
  });
}

/* --------------------------load date in navbar-------------------------- */
var showTodaysDate = function() {
  n =  new Date();
  y = n.getFullYear();
  m = n.getMonth() + 1;
  d = n.getDate();
  $("#todaysDate").html("Today is " + m + "/" + d + "/" + y);
};

/* full calendar gives newly created given different ids in month/week view
    and day view. create/edit event in day (right) view, so correct for
    id change to update in month/week (left)
  */
var getCal1Id = function(cal2Id) {
  var num = cal2Id.replace('_fc', '') - 1;
  var id = "_fc" + num;
  return id;
}

var disableEnter = function() {
  $('body').bind("keypress", function(e) {
      if (e.keyCode == 13) {
          e.preventDefault();
          return false;
      }
  });
}
