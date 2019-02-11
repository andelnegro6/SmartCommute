$(document).ready(function(){
    function checkUser(){
        return new Promise(function(resolve, reject){
          firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              var uid = user.uid;
              resolve(uid);
            } else {
              reject("User is not logged in");
            }
          });
        });
    }

    var settings = function(){
        checkUser().then(function(uid){
            console.log("i just passed " + uid + " successfully!");
            //if there isn't any settings data on DB, load the first time w push(?)
            //if settings is present in DB, just load as you'd load the events
            var settingsRef = firebase.database().ref('users/' + uid + '/settings/');
            if (settingsRef = null){
                //PUSH for the first time the default settings
            } else{
                //snapshot of the settings
                settingsRef.once('value', settingsData, sErrData);
            }
        }).catch(function(error){
            alert(error);
        });
    };

    function settingsData (data) {

    };

    function sErrData (err) {
        console.log("ERROR!" + err);
    };

    var prefTransport = $('select#prefTransport').val();
    // switch(prefTransport){
    //     //cases of each transport, save it into a value and send it to firebase
    // }

    var a_car = $('input#a_car').val();
    var a_walk = $('input#a_walk').val();
    var a_bike = $('input#a_bike').val();
    var a_metro = $('input#a_metro').val();
    var a_bus = $('input#a_bus').val();
    var a_tram = $('input#a_tram').val();
    var availTransports = [a_car, a_walk, a_bike, a_metro, a_bus, a_tram]; //array of booleans
    
    console.log(prefTransport, a_car);

    // settings(); 

    $("#saveNexit").on('click', function(){
        var user = firebase.auth().currentUser;
        if (user != null){
            uid = user.uid;
        }

        //updates the settings once we click the button save & exit
    });
});