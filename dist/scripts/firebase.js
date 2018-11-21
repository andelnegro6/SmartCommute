"use strict";

var app_fireBase = {};
(function () {
    var config = {
        apiKey: "AIzaSyDs3D1g5QObX9iyVtKbi4E_2ZSQ2EyEocw",
        authDomain: "travlendar-977c5.firebaseapp.com",
        databaseURL: "https://travlendar-977c5.firebaseio.com",
        projectId: "travlendar-977c5",
        storageBucket: "travlendar-977c5.appspot.com",
        messagingSenderId: "1015307388650"
    };
    firebase.initializeApp(config);
    var database = firebase.database;
    app_fireBase = firebase;
})();