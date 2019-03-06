$(document).ready(function(){
  checkAuth();
  //CALENDAR DATA
  $('#calendarInRoadmap').fullCalendar({
    header: {
      right: 'prev,next today'
    },
    eventOverlap: false,
    selectable: true,
    selectHelper: true,
    allDaySlot: false,
    slotEventOverlap: false,
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

  var showTodaysDate = function() {
    var nuDate =  new Date();
    var y = nuDate.getFullYear();
    var m = nuDate.getMonth() + 1;
    var d = nuDate.getDate();
    $("#todaysDate").html("Today is " + d + "/" + m + "/" + y + "!");
  };

  /*------------------MY LOCATION--------------------*/  
  function getLocation(){
    if(navigator.geolocation){
      $('#calendarInRoadmap').fullCalendar('changeView', 'agendaDay'); 
      navigator.geolocation.getCurrentPosition(showPosition);
    } else{
      alert("geolocation is not supported by this browser.");
    }
  }
 
  var showPosition = function (pos){
    var pcoords = pos.coords;
    var myPosX = pcoords.latitude;
    var myPosY = pcoords.longitude;
    mapWmyLoc(myPosX,myPosY);
  }  
  /*-----------------------------------------------------Maps rendering process--------------------------------------------------------*/
  /*--------------------------Map initialization----------------------------*/
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

    /*--------------user ID retrieval------------------*/
    var auth = firebase.auth();
    var user = auth.currentUser; //retrieve current user's info
    var uid;//declare the relevant data
    if (user != null) {
      uid = user.uid;  
    }

    /*---------------------------Event retrieval-------------------------------*/ 
    firebase.database().ref('users/' + uid + "/events/").once('value').then(function(data){
      var allEvents = data.toJSON();
      console.log(allEvents); //SHOWS EVENTS
      var userEvents = [];
      var todaysDate = moment();
      for (var i in allEvents){ 
        if(moment(allEvents[i].end) - todaysDate > 0){ //filter all the events after today's date
          allEvents[i].start = moment(allEvents[i].start);
          allEvents[i].end = moment(allEvents[i].end);
          userEvents.push(allEvents[i]);
          console.log(allEvents[i]);
        }
      }
      console.log(userEvents);
      userEvents.sort((left, right) => { //sort the upcoming events in ascending order
        return left.start.diff(right.start);
      });
      console.log(userEvents);
      /*-----------------------geocoding of addresses, routing and rendering--------------------------*/
      var geocoder = platform.getGeocodingService(); 
      // var myRouter = platform.getRoutingService();
      var waypoints = [];
      var waypoint0 = 'geo!'+myPosX.toString()+','+myPosY.toString();
      waypoints.push(waypoint0); //first element: my location

      // for (var i in userEvents){
      //   console.log(userEvents[i].location);
      //   var curEvtGeoParams = {searchText: userEvents[i].location, jsonattributes: 1};
      //   getEaEvtCoords(platform, waypoints, userEvents[i], curEvtGeoParams, function(platform, waypoints, curEvt){
      //     var waypoint0 = waypoints[i];
      //     var waypoint1 = waypoints[parseInt(i)+1];
      //     getEaEvtRoutes(platform, waypoint0, waypoint1, curEvt, function(curEvt, route){
      //       console.log(curEvt);
      //       console.log(route);
      //     });
      //   });
      // }

      //OMIT FROM HERE 
      gotAllUpcEvtCoords(geocoder, myPosX, myPosY, userEvents, function(userEvents, myPosX, myPosY){
        console.log(userEvents, myPosX, myPosY);
        var myRouter = platform.getRoutingService();
        gotAllUpcEvtRoutes(myRouter, myPosX, myPosY, userEvents, function(userEvents, routes){
          //from here on, we render the events and the routes generated
          console.log(userEvents, routes);
          var behavior = new H.mapevents.Behavior(mapEvents);
          var ui = H.ui.UI.createDefault(map, defaultLayers);
        
          for (var k = 0; k < userEvents.length; k++){
            var routeShape = routes[k].shape;
            
            var linestring = new H.geo.LineString();
            routeShape.forEach(function(point) {
              var parts = point.split(',');
              linestring.pushLatLngAlt(parts[0], parts[1]);
            });
            // Create a polyline to display the route:
            var routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: 'blue', lineWidth: 10 }
            });

            var startPoint = routes[k].waypoint[0].mappedPosition; 
            var endPoint = routes[k].waypoint[1].mappedPosition;
            
            // Create a marker for start and end points k
            var startMarker = new H.map.Marker({
              lat: startPoint.latitude,
              lng: startPoint.longitude
            });
            var endMarker = new H.map.Marker({
              lat: endPoint.latitude,
              lng: endPoint.longitude
            });
            // waypointMarkers.push(startMarker);
            // waypointMarkers.push(endMarker);
            
            map.addObjects([routeLine, startMarker, endMarker]);
            ui.addBubble(new H.ui.InfoBubble({
              lat: endPoint.latitude,
              lng: endPoint.longitude
            }, {content: userEvents[k].title + '. ' + userEvents[k].location + '. Time: ' + userEvents[k].start.format('HH:mm')}));
            map.setViewBounds(routeLine.getBounds());
          };
        });
      });
      //UNTIL HERE
    }); 
  }

  function checkAuth() {
    var mainApp = {};
    (function () {
      var firebase = app_fireBase;
      var uid = null;
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          // User is signed in.
          uid = user.uid;
          showTodaysDate();
          getLocation(); 
        }
        else {
          uid = null;
          window.location.replace("index.html");
        }
      });
      function logOut() {
        firebase.auth().signOut();
      }
      mainApp.logOut = logOut;
    })();
  }

  //option1
  // var getEaEvtCoords = function(platform, waypoints, curEvt, curEvtGeoParams, callback){
  //   var geocoder = platform.getGeocodingService();
  //   geocoder.geocode(curEvtGeoParams, function(result){
  //     var curEvtCoords = result.response.view[0].result;
  //     var coord_ = 'geo!'+curEvtCoords[0].location.displayPosition.latitude.toString()+','+curEvtCoords[0].location.displayPosition.longitude.toString();
  //     curEvt['coordsStr'] = coord_;
  //     curEvt['lat'] = curEvtCoords[0].location.displayPosition.latitude;
  //     curEvt['long'] = curEvtCoords[0].location.displayPosition.longitude;
  //     waypoints.push(coord_); //adds current event to last waypoint index
  //     callback(platform, waypoints, curEvt);
  //   }, onError);
  // }

  // var getEaEvtRoutes = function(platform, waypoint0, waypoint1, curEvt, callback){
  //   var myRouter = platform.getRoutingService();
  //   var routetonext = {
  //     'mode': 'fastest;car',
  //     'waypoint0': waypoint0,
  //     'waypoint1': waypoint1,
  //     'representation': 'display'
  //   };
  //   myRouter.calculateRoute(routetonext, function(result){
  //     var route = result.response.route[0];
  //     callback(curEvt, route);
  //   }, function (err) { alert(err.message); });
  // }

  // option 2
  // function that retrieves from here maps all the event coordinates
  var gotAllUpcEvtCoords = function(geocoder, myPosX, myPosY, userEvents, callback){
    for (var i=0; i < userEvents.length; i++){
      console.log(userEvents[i].location);
      var curEvtGeoParams = {searchText: userEvents[i].location, jsonattributes: 1};
      geocodingEach(geocoder, curEvtGeoParams, userEvents, i, callback, myPosX, myPosY); 
    } 
  }

  var gotAllUpcEvtRoutes = function(myRouter, myPosX, myPosY, userEvents, callback){
    var waypoints = [];
    var eventRoutes = [];
    var waypoint0 = 'geo!'+myPosX.toString()+','+myPosY.toString();
    waypoints.push(waypoint0); //first waypoint will always be mylocation
    for (var k = 0; k <= userEvents.length; k++){
      if (userEvents[k] != undefined){ //if event is last
        waypoints.push(userEvents[k].coordsStr); //waypoints[1]=userEvents[0].coords
        console.log(waypoints); 
      } else {
        waypoints.push(userEvents[k-1].coordsStr); //pushes repeated coords to allow the route request
      }
      //take element 0, take element 1 and create route
      //until element k+1 is undefined
      var routetonext = {
        'mode': 'fastest;car',
        'waypoint0': waypoints[k],
        'waypoint1': waypoints[k+1],
        'representation': 'display'
      };
      routingEach(myRouter, routetonext, eventRoutes, waypoints, k, callback, userEvents);
    }
  }
});
 
function routingEach(myRouter, routetonext, eventRoutes, waypoints, k, callback, userEvents) {
  myRouter.calculateRoute(routetonext, function (result) {
    console.log(result.response.route[0]); //gives result
    eventRoutes.push(result.response.route[0]);
    if (waypoints[k] == waypoints[k + 1]) {
      eventRoutes.pop(); //pops out the last route in case 
      callback(userEvents, eventRoutes); //userEvents.length = k, eventRoutes.length = k-1
    }
  }, function (err) { alert(err.message); });
}

function geocodingEach(geocoder, curEvtGeoParams, userEvents, i, callback, myPosX, myPosY) {
  geocoder.geocode(curEvtGeoParams, function (result) {
    var curEvtCoords = result.response.view[0].result;
    console.log(curEvtCoords, userEvents[i]);
    var coord_ = 'geo!' + curEvtCoords[0].location.displayPosition.latitude.toString() + ',' + curEvtCoords[0].location.displayPosition.longitude.toString();
    userEvents[i]['coordsStr'] = coord_; //appends the coordinates to the user events
    userEvents[i]['lat'] = curEvtCoords[0].location.displayPosition.latitude;
    userEvents[i]['long'] = curEvtCoords[0].location.displayPosition.longitude;
    console.log(userEvents[i], coord_);
    console.log(curEvtCoords, userEvents[i].coordsStr);
    if (i + 1 == userEvents.length) {
      //triggers callback fcn with new key of coordinates in each eventdata item
      callback(userEvents, myPosX, myPosY);
    }
  }, onError);
}
