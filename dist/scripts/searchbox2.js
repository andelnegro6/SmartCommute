'use strict';

/* -------------------------- Googlemaps search box 2-------------------------- */
var placeSearch2, autocomplete2, geocoder2;

function initAutocomplete() {
  geocoder2 = new google.maps.Geocoder();
  autocomplete2 = new google.maps.places.Autocomplete(document.getElementById('autocomplete2'));

  autocomplete2.addListener('place_changed', fillInAddress);
}

function codeAddress(address) {
  geocoder2.geocode({ 'address': address }, function (results, status) {
    if (status == 'OK') {
      alert(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function fillInAddress() {
  var place = autocomplete2.getPlace();
  alert(place.place_id);
  //   codeAddress(document.getElementById('autocomplete').value);
}