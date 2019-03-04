'use strict';

$(document).ready(function () {
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
    allDay: true,
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    timezone: 'America/Chicago',
    // select: function(startDate, endDate) { },
    // dayClick: function(startDate) { },
    // eventClick: function(calEvent, jsEvent, view) {
    //   //center on the map the event's popup selected.
    // },
    eventRender: function eventRender(eventObj, $el) {
      var inizio = eventObj.start.format().slice(11, 16);
      var fine = eventObj.end.format().slice(11, 16);
      $el.addClass(eventObj.description);
      $el.popover({
        title: eventObj.title,
        content: "start time: " + inizio + ", end time: " + fine,
        trigger: 'hover',
        placement: 'top',
        container: 'body'
      });
    },
    eventSources: ['../scripts/events.js', '../scripts/settings.js']
  });

  var showTodaysDate = function showTodaysDate() {
    var nuDate = new Date();
    var y = nuDate.getFullYear();
    var m = nuDate.getMonth() + 1;
    var d = nuDate.getDate();
    $("#todaysDate").html("Today is " + d + "/" + m + "/" + y + "!");
  };

  /*------------------MY LOCATION--------------------*/
  function getLocation() {
    if (navigator.geolocation) {
      $('#calendarInRoadmap').fullCalendar('changeView', 'agendaDay');
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert("geolocation is not supported by this browser.");
    }
  }

  var showPosition = function showPosition(pos) {
    var pcoords = pos.coords;
    var myPosX = pcoords.latitude;
    var myPosY = pcoords.longitude;
    mapWmyLoc(myPosX, myPosY);
  };
  /*-----------------------------------------------------Maps rendering process--------------------------------------------------------*/
  /*--------------------------Map initialization----------------------------*/
  function mapWmyLoc(myPosX, myPosY) {
    var platform = new H.service.Platform({ //my heremaps platform
      'app_id': 'SKrth5W6mIRCcxVYfDWi',
      'app_code': 'bW5PezhhynKJWF85-sSZlA'
    });
    console.log(myPosX, myPosY); // SHOWS LOCATION!
    var defaultLayers = platform.createDefaultLayers();
    var map = new H.Map(document.getElementById('mapContainer'), defaultLayers.normal.map, {
      zoom: 10,
      center: { lat: myPosX, lng: myPosY }
    });
    var mapEvents = new H.mapevents.MapEvents(map);
    //shows that a click has been made in console log:
    map.addEventListener('tap', function (evt) {
      console.log(evt.type, evt.currentPointer.type);
    });
    var behavior = new H.mapevents.Behavior(mapEvents);
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    /*--------------user ID retrieval------------------*/
    var auth = firebase.auth();
    var user = auth.currentUser; //retrieve current user's info
    var uid; //declare the relevant data
    if (user != null) {
      uid = user.uid;
    }

    /*---------------------------Event retrieval-------------------------------*/
    firebase.database().ref('users/' + uid + "/events/").once('value').then(function (data) {
      var allEvents = data.toJSON();
      console.log(allEvents); //SHOWS EVENTS
      var userEvents = [];
      var todaysDate = moment();
      for (var i in allEvents) {
        if (moment(allEvents[i].end) - todaysDate > 0) {
          //filter all the events after today's date
          allEvents[i].start = moment(allEvents[i].start);
          allEvents[i].end = moment(allEvents[i].end);
          userEvents.push(allEvents[i]);
          console.log(allEvents[i]);
        }
      }
      console.log(userEvents);
      userEvents.sort(function (left, right) {
        //sort the upcoming events in ascending order
        return left.start.diff(right.start);
      });
      console.log(userEvents);
      /*-----------------------geocoding of addresses---------------------*/
      var geocoder = platform.getGeocodingService();

      gotAllUpcEvtCoords(geocoder, myPosX, myPosY, userEvents, function (userEvents, myPosX, myPosY) {
        console.log(userEvents, myPosX, myPosY);
        var myRouter = platform.getRoutingService();
        gotAllUpcEvtRoutes(myRouter, myPosX, myPosY, userEvents, function (userEvents, routes) {
          //from here on, we render the events and the routes generated
          console.log(userEvents, routes);
          var waypointsToRender = [];
          var waypointMarkers = [];
          var routeShape = route.shape;
          // Create a linestring to use as a point source for the route line
          var linestring = new H.geo.LineString();
          routeShape.forEach(function (point) {
            var parts = point.split(',');
            linestring.pushLatLngAlt(parts[0], parts[1]);
          });
          // Create a polyline to display the route:
          var routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: 'blue', lineWidth: 10 }
          });
          for (var k = 0; k <= userEvents.length; k++) {
            // Create a marker for the start point:
            var curMarker = new H.map.Marker({
              lat: userEvents[i].lat,
              lng: userEvents[i].long
            });
            waypointMarkers.push(curMarker);
          }
        });
      });
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
        } else {
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

  //function that retrieves from here maps all the event coordinates
  var gotAllUpcEvtCoords = function gotAllUpcEvtCoords(geocoder, myPosX, myPosY, userEvents, callback) {
    for (var i in userEvents) {
      console.log(userEvents[i].location);
      var curEvtGeoParams = { searchText: userEvents[i].location, jsonattributes: 1 };
      geocoder.geocode(curEvtGeoParams, function (result) {
        var curEvtCoords = result.response.view[0].result;
        console.log(curEvtCoords);
        var coord_ = 'geo!' + curEvtCoords[0].location.displayPosition.latitude.toString() + ',' + curEvtCoords[0].location.displayPosition.longitude.toString();
        userEvents[i]['coordsStr'] = coord_; //appends the coordinates to the user events
        userEvents[i]['lat'] = location.displayPosition.latitude;
        userEvents[i]['long'] = location.displayPosition.longitude;
        console.log(userEvents[i], coord_);
        console.log(curEvtCoords, userEvents[i].coords);
        if (i + 1 == userEvents.length) {
          //triggers callback fcn with new key of coordinates in each eventdata item
          callback(userEvents, myPosX, myPosY);
        }
      }, onError);
    }
  };

  var gotAllUpcEvtRoutes = function gotAllUpcEvtRoutes(myRouter, myPosX, myPosY, userEvents, callback) {
    var waypoints = [];
    var eventRoutes = [];
    var waypoint0 = 'geo!' + myPosX.toString() + ',' + myPosY.toString();
    waypoints.push(waypoint0); //first waypoint will always be mylocation
    for (var k = 0; k <= userEvents.length; k++) {
      if (userEvents[k] != undefined) {
        //if event is last
        waypoints.push(userEvents[k].coords); //waypoints[1]=userEvents[0].coords
        console.log(waypoints);
        //take element 0, take element 1 and create route
        //until element k+1 is undefined
        var routetonext = {
          'mode': 'fastest;car',
          'waypoint0': waypoints[k],
          'waypoint1': waypoints[k + 1],
          'representation': 'display'
        };
        myRouter.calculateRoute(routetonext, function (result) {
          console.log(result.response.route[0]); //gives result
          eventRoutes.push(result.response.route[0]);
        }, function (err) {
          alert(err.message);
        });
      } else {
        callback(userEvents, eventRoutes); //userEvents.length = k, eventRoutes.length = k-1
      }
    }
  };
});

/* map's engine pseudocode:
  get today's events title, location, starttimes, endtimes, id and description (note that events is already loaded so no need for snapshot maybe)
  
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