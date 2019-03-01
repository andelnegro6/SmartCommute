"use strict";

$(document).ready(function () {
    //globally declare settings values
    var defaultSettings = {
        "availableTransports": [false, true, true, true, true, true],
        "preferredTransport": 'bus'
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
        if (data.toJSON() != null || data.toJSON() != undefined) {
            //shows: {availTransports, prefTransport} as a JSON
            userSettings = data.toJSON();
            loadDatasOnFrontEnd(userSettings);
        } else if (data.toJSON() == null) {
            //if no settings set, must create default ones:
            loadDatasOnFrontEnd(defaultSettings);
        }
    };

    function updateDefSets() {
        var updSettings = {};
        updSettings['/users/' + uid + '/settings/'] = defaultSettings;
        firebase.database().ref().update(updSettings);
    }

    function sErrData(err) {
        console.log("ERROR!" + err);
    };

    function loadDatasOnFrontEnd(settings) {
        // console.log(settings.availableTransports, settings.preferredTransport);
        $('input#a_car').prop("checked", settings.availableTransports[0]);
        $('input#a_walk').prop("checked", settings.availableTransports[1]);
        $('input#a_bike').prop("checked", settings.availableTransports[2]);
        $('input#a_metro').prop("checked", settings.availableTransports[3]);
        $('input#a_bus').prop("checked", settings.availableTransports[4]);
        $('input#a_tram').prop("checked", settings.availableTransports[5]);
        $('select#prefTransport').val(settings.preferredTransport);
    }

    getSettings();

    $("#saveNexit").on('click', function () {
        //config inputs:
        var prefTransport = $('select#prefTransport').val();
        var a_car = $('input#a_car').prop("checked") || false;
        var a_walk = $('input#a_walk').prop("checked") || false;
        var a_bike = $('input#a_bike').prop("checked") || false;
        var a_metro = $('input#a_metro').prop("checked") || false;
        var a_bus = $('input#a_bus').prop("checked") || false;
        var a_tram = $('input#a_tram').prop("checked") || false;
        var availTransports = [a_car, a_walk, a_bike, a_metro, a_bus, a_tram];

        console.log(prefTransport, availTransports);

        var user = firebase.auth().currentUser;
        var uid;
        if (user != null) {
            uid = user.uid;
        }
        userSettings = {
            availableTransports: availTransports,
            preferredTransport: prefTransport
        };
        var settingsRef = firebase.database().ref('users/' + uid + '/settings/');
        settingsRef.set(userSettings);
        settingsRef.once('value', function (data) {
            loadDatasOnFrontEnd(data.toJSON());
        }, sErrData);
    });
});