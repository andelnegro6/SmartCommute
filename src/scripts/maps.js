$(document).ready(function(){
  //CALENDAR DATA
  $('#calendarInRoadmap').fullCalendar({
    eventOverlap: false,
    allDay:true,
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    timezone: 'America/Chicago',
    // select: function(startDate, endDate) { },
    // dayClick: function(startDate) { },
    // eventClick: function(calEvent, jsEvent, view) {
    //   //center on the map the event's popup selected.
    // },
    eventRender: function(eventObj, $el) {
      var inizio=eventObj.start.format().slice(11,16);
      var fine=eventObj.end.format().slice(11,16);
      $el.addClass(eventObj.description);
      $el.popover({
        title: eventObj.title,
        content: "start time: "+inizio+", end time: "+fine,
        trigger: 'hover',
        placement: 'top',
        container: 'body'
      });
    },
    eventSources: ['../scripts/events.js', '../scripts/settings.js']
  });

  var initializeRightCalendar = function()  {
    $('#calendarInRoadmap').fullCalendar('changeView', 'agendaDay');
    $('#calendarInRoadmap').fullCalendar('option', {
      slotEventOverlap: false,
      allDaySlot: false,
      header: {
        right: 'prev,next today'
      },
      selectable: true,
      selectHelper: true,
    });
  }

  var showTodaysDate = function() {
    var nuDate =  new Date();
    var y = nuDate.getFullYear();
    var m = nuDate.getMonth() + 1;
    var d = nuDate.getDate();
    $("#todaysDate").html("Today is " + d + "/" + m + "/" + y + "!");
  };

  showTodaysDate();
  initializeRightCalendar();

  /*------------------MY LOCATION--------------------*/  
  function getLocation(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(showPosition);
    } else{
      alert("geolocation is not supported by this browser.");
    }
  }

  function showPosition(pos){
    var pcoords = pos.coords;
    var myPosX = pcoords.latitude;
    var myPosY = pcoords.longitude;
    mapWmyLoc(myPosX,myPosY);
  }

  getLocation();
  /*--------------------------------------------------------MAPS DATA--------------------------------------------------------------*/
  function mapWmyLoc(myPosX, myPosY){
    var platform = new H.service.Platform({ //my heremaps platform
      'app_id': 'SKrth5W6mIRCcxVYfDWi',
      'app_code': 'bW5PezhhynKJWF85-sSZlA'
    });
    console.log(myPosX,myPosY); // SHOWS LOCATION!
    var defaultLayers = platform.createDefaultLayers();
    var map = new H.Map(
      document.getElementById('mapContainer'),
      defaultLayers.normal.map,
      {
      zoom: 10,
      center: { lat: myPosX, lng: myPosY }
      });

    var mapEvents = new H.mapevents.MapEvents(map);
    
    //shows that a click has been made in console log:
    map.addEventListener('tap', function(evt){
      console.log(evt.type, evt.currentPointer.type);
    });

    var behavior = new H.mapevents.Behavior(mapEvents);
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    var userEvents = $('#calendarInRoadmap').fullCalendar('clientEvents');
    console.log(userEvents); //SHOWS EVENTS

    //now, to get every event data:
    var eventTimes = [];
    var todaysDate = new Date;
    for (var i in userEvents){ 
      if(userEvents[i].end - todaysDate > 0){ //filter all the events after today's date
        eventTimes.push(userEvents[i].start);
        eventTimes.push(userEvents[i].end);
      }
    }
    console.log(eventTimes);
    eventTimes.sort((left, right) => {
      return left.time.diff(right.time);
    })
    console.log(eventTimes);
  
    /* map's engine pseudocode:
      get today's events title, location, starttimes, endtimes, id and description (note that events is already loaded so no need for snapshot maybe)
      generate the nodes object rearranging all the data
      
    */

    //INSERT THINGS of GUIDES FROM HERE:
    // var routingParameters = {
    //   // The routing mode:
    //   'mode': 'fastest;car',
    //   // The start point of the route:
    //   'waypoint0': 'geo!50.1120423728813,8.68340740740811',
    //   // The end point of the route:
    //   'waypoint1': 'geo!52.5309916298853,13.3846220493377',
    //   // To retrieve the shape of the route we choose the route
    //   // representation mode 'display'
    //   'representation': 'display'
    // };

    // // Define a callback function to process the routing response:
    // var onResult = function(result) {
    //   var route,
    //     routeShape,
    //     startPoint,
    //     endPoint,
    //     linestring;
    //   if(result.response.route) {
    //   // Pick the first route from the response:
    //   route = result.response.route[0];
    //   // Pick the route's shape:
    //   routeShape = route.shape;
    
    //   // Create a linestring to use as a point source for the route line
    //   linestring = new H.geo.LineString();
    
    //   // Push all the points in the shape into the linestring:
    //   routeShape.forEach(function(point) {
    //     var parts = point.split(',');
    //     linestring.pushLatLngAlt(parts[0], parts[1]);
    //   });
    
    //   // Retrieve the mapped positions of the requested waypoints:
    //   startPoint = route.waypoint[0].mappedPosition;
    //   endPoint = route.waypoint[1].mappedPosition;
    
    //   // Create a polyline to display the route:
    //   var routeLine = new H.map.Polyline(linestring, {
    //     style: { strokeColor: 'blue', lineWidth: 10 }
    //   });
    
    //   // Create a marker for the start point:
    //   var startMarker = new H.map.Marker({
    //     lat: startPoint.latitude,
    //     lng: startPoint.longitude
    //   });
    
    //   // Create a marker for the end point:
    //   var endMarker = new H.map.Marker({
    //     lat: endPoint.latitude,
    //     lng: endPoint.longitude
    //   });
    
    //   // Add the route polyline and the two markers to the map:
    //   map.addObjects([routeLine, startMarker, endMarker]);
    
    //   // Set the map's viewport to make the whole route visible:
    //   map.setViewBounds(routeLine.getBounds());
    //   }
    // };

    // // Get an instance of the routing service:
    // var router = platform.getRoutingService();
    
    // // Call calculateRoute() with the routing parameters,
    // // the callback and an error callback function (called if a
    // // communication error occurs):
    // router.calculateRoute(routingParameters, onResult,
    //   function(error) {
    //     alert(error.message);
    //   });
  }   
});