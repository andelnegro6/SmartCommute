"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

$(document).ready(function () {
    //globally declare settings values
    var defaultSettings = {
        "availableTransports": [0, 1, 1, 1, 1, 1],
        "preferredTransport": 'metro'
    };
    var userSettings = {};

    function checkUser() {
        return new Promise(function (resolve, reject) {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    var uid = user.uid;
                    resolve(uid);
                } else {
                    reject("User is not logged in");
                }
            });
        });
    }

    var getSettings = function getSettings() {
        checkUser().then(function (uid) {
            //if there isn't any settings data on DB, load the first time the defaultsets JSON
            //if settings is present in DB, just load as you'd load the events
            var settingsRef = firebase.database().ref('users/' + uid + '/settings/');
            settingsRef.once('value', settingsData, sErrData);
        }).catch(function (error) {
            alert(error);
        });
    };

    function settingsData(data) {
        if (data != null || data != undefined) {
            userSettings = data.toJSON();
            //shows: {availTransports, prefTransport} as a JSON
        } else {
            //if no settings set, must create default ones:
            var updSettings = {};
            updSettings['/users/' + uid + '/settings/'] = defaultSettings;
            firebase.database().ref().update(updSettings);
        }
    };

    function sErrData(err) {
        console.log("ERROR!" + err);
    };

    getSettings();

    //config inputs:
    var prefTransport = $('select#prefTransport').val();

    var a_car = $('input#a_car').val();
    var a_walk = $('input#a_walk').val();
    var a_bike = $('input#a_bike').val();
    var a_metro = $('input#a_metro').val();
    var a_bus = $('input#a_bus').val();
    var a_tram = $('input#a_tram').val();
    var availTransports = [a_car, a_walk, a_bike, a_metro, a_bus, a_tram]; //array of booleans

    console.log(prefTransport, availTransports);
    console.log(typeof prefTransport === "undefined" ? "undefined" : _typeof(prefTransport));

    $("#saveNexit").on('click', function () {
        var user = firebase.auth().currentUser;
        var uid;
        if (user != null) {
            uid = user.uid;
        }
        userSettings = {
            "availableTransports": availTransports,
            "preferredTransport:": prefTransport
        };
        var settingsRef = firebase.database().ref('users/' + uid + '/settings/');
        settingsRef.set(userSettings);
    });
});