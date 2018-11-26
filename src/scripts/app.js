$(document).ready(function(){
  var inicio='';
  var fin='';
  var newEventKey;

  //fullCalendar configuration:
  $('#calendar').fullCalendar({
    header: {
    left: 'today prev,next',
    center: 'title',
    right: 'timelineDay,timelineThreeDays,agendaWeek,month,listWeek'
  },

    slotEventOverlap: false,
    allDay:true,
    selectable: true,
    selectHelper: true,
    defaultView: 'listWeek',
    navLinks: true, // can click day/week names to navigate views
    editable: false,
    eventLimit: true, // allow "more" link when too many events
    timezone: 'America/Chicago',

    select: function(startDate, endDate) {
      inicio = startDate.format();
      fin = endDate.format();
      newEvent(startDate);
    },
    
    eventClick: function(calEvent, jsEvent, view) {
      editEvent(calEvent);
      console.log(calEvent.id); //each event's ID is shown! good.
    },

  //Modify the event adding a new element and generate a pop over of title and description
    eventRender: function(eventObj, $el) {
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
  var loadEvents = function() {
    $.getScript("scripts/events.js", function(){
    });
  };

  //Update new event function
  var writeNewEvent = function(uid, title, description, start, end){
    var eventData = {
      title: title,
      start: start,
      end: end,
      description: description
    };

    newEventKey = firebase.database().ref().child('events').push().key;
    var updates = {};

    updates['/users/' + uid + '/events/' + newEventKey] = eventData;
    return firebase.database().ref().update(updates), newEventKey;
  };

  //Create a newEvent
  var newEvent = function(startDate){
    $('input#title').val("");
    $('textarea#info_description').val("");
    $('#newEvent').modal('show');
    $('#submit').unbind();

    $('#submit').on('click', function() {
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
      var dia2 ='';
      var mes2 ='';

      if (mes.toString().length < 2){
        mes2 = '0' + mes.toString();
      }else{
        mes2= mes.toString();
      }
      
      if(dia.toString().length < 2){
        dia2 = '0' + dia.toString();
      }else{
        dia2= dia.toString();
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

        writeNewEvent(uid, eventData.title, eventData.description, eventData.start, eventData.end);
        eventData.id = newEventKey; //appends the id generated from DB to the event
        console.log(eventData);
        
        //renders event onto calendar with ID generated from firebase DB
        $('#calendar').fullCalendar('renderEvent', eventData, true);
        $('#newEvent').modal('hide');

      }else{
        alert("Title can't be blank. Please try again.");
      }
    });
  };
  
  //Edit an event:
  var editEvent = function(calEvent) {
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
  
    $('#update').on('click', function() {
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
      } //what we actually care for here is uid

      var ano_s = (calEvent.start._d.getUTCFullYear()).toString();
      var mes_s = (calEvent.start._d.getUTCMonth() + 1).toString();
      var dia_s = (calEvent.start._d.getUTCDate()).toString();
      var ano_e = (calEvent.end._d.getUTCFullYear()).toString();
      var mes_e = (calEvent.end._d.getUTCMonth() + 1).toString();
      var dia_e = (calEvent.end._d.getUTCDate()-1).toString();
      
      if(dia_s.length < 2){
        dia_s = '0' + dia_s;
      }else{
        dia_s = dia_s;
      }

      if(mes_s.length < 2){
        mes_s = '0' + mes_s;
      }else{
        mes_s = mes_s;
      }

      if(dia_e.length < 2){
        dia_e = '0' + dia_e;
      }else{
        dia_e = dia_e;
      }

      if(mes_e.length < 2){
        mes_e= '0' + mes_e;
      }else{
        mes_e = mes_e;
      }

      var f_inicio = ano_s + '-' + mes_s + '-' + dia_s;
      var f_fin = ano_e + '-' + mes_e + '-' + dia_e;
      console.log(f_inicio, f_fin);

      if (title){
        calEvent.description = comentario;
        calEvent.title = title;
        calEvent.start = f_inicio + "T"+ stiempo + ":00.000Z";
        calEvent.end = f_fin + "T" + etiempo + ":00.000Z";
        
        var eventData={
          title: title,
          start: f_inicio + "T" + stiempo + ":00.000Z",
          end: f_fin + "T" + etiempo + ":00.000Z",
          description: comentario
        };

        $('#calendar').fullCalendar('updateEvent', calEvent);
        $('#editEvent').modal('hide');

        //we need to set given event. It must be event with its ID
        firebase.database().ref('users/' + uid + '/events/' + calEvent.id).set({
          title: eventData.title,
          description : eventData.description,
          start: eventData.start,
          end: eventData.end
        });
      }else{
        alert("Title can't be blank. Please try again.")
      }
    });
    
    $('#delete').on('click', function() {
      var user = firebase.auth().currentUser;
      var uid;
      if (user != null) {
        uid = user.uid;
      } 
      firebase.database().ref('users/' + uid + '/events/' + calEvent.id).set(null);

      $('#delete').unbind();
      if (calEvent._id.includes("_fc")){
        $('#calendar').fullCalendar('removeEvents', [getCal1Id(calEvent._id)]);
        $('#calendar').fullCalendar('removeEvents', [calEvent._id]);
      }else{
        $('#calendar').fullCalendar('removeEvents', [calEvent._id]);
      }
      $('#editEvent').modal('hide');
    });
  }
});

/* --------------------------Others-------------------------- */
var getCal1Id = function(cal2Id) {
  var num = cal2Id.replace('_fc', '') - 1;
  var id = "_fc" + num;
  return id;
}
/* --------------------------others-------------------------- */
var disableEnter = function() {
  $('body').bind("keypress", function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      return false;
    }
  });
}