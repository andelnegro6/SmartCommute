'use strict';

/* -------------------------- Googlemaps search box-------------------------- */

var placeSearch, autocomplete, geocoder, placeSearch2, autocomplete2, geocoder2, editplaceSearch, editautocomplete, editgeocoder, editplaceSearch2, editautocomplete2, editgeocoder2;

function initAutocomplete() {
  /* --- box 1-- */
  geocoder = new google.maps.Geocoder();
  autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
  autocomplete.addListener('place_changed', fillInAddress);
  /* --- box 2-- */
  autocomplete2 = new google.maps.places.Autocomplete(document.getElementById('autocomplete2'));
  autocomplete2.addListener('place_changed', fillInAddress);

  /* --- editbox 1-- */
  editgeocoder = new google.maps.Geocoder();
  editautocomplete = new google.maps.places.Autocomplete(document.getElementById('editautocomplete'));
  editautocomplete.addListener('place_changed', fillInAddress);
  /* --- editbox 2-- */
  editautocomplete2 = new google.maps.places.Autocomplete(document.getElementById('editautocomplete2'));
  editautocomplete2.addListener('place_changed', fillInAddress);
}

function codeAddress(address) {
  /* --- box 1-- */
  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status == 'OK') {
      alert(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
  /* --- box 2-- */
  geocoder2.geocode({ 'address': address }, function (results, status) {
    if (status == 'OK') {
      alert(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });

  /* --- editbox 1-- */
  editgeocoder.geocode({ 'address': address }, function (results, status) {
    if (status == 'OK') {
      alert(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
  /* --- editbox 2-- */
  editgeocoder2.geocode({ 'address': address }, function (results, status) {
    if (status == 'OK') {
      alert(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function fillInAddress() {
  /* --- box 1-- */
  var place = editautocomplete.getPlace();
  alert(place.place_id);
  //   codeAddress(document.getElementById('autocomplete').value);
  /* --- box 2-- */
  var place2 = editautocomplete2.getPlace();
  alert(place2.place_id);
  //   codeAddress(document.getElementById('autocomplete').value);

  /* --- box 1-- */
  var editplace = editautocomplete.getPlace();
  alert(editplace.place_id);
  //   codeAddress(document.getElementById('autocomplete').value);
  /* --- box 2-- */
  var editplace2 = editautocomplete2.getPlace();
  alert(editplace2.place_id);
  //   codeAddress(document.getElementById('autocomplete').value);
}