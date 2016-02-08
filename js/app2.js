var map;
var infowindow;
var marker;
var initialPlaces=ko.observableArray();
var timeout=3000;

//Function initializing the map with markers
function initMap() {
  var abudhabi = {lat: 24.472221, lng: 54.328119};
  map = new google.maps.Map(document.getElementById('map'), {
    center: abudhabi,
    zoom: 14
  });

  infowindow = new google.maps.InfoWindow();

  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: abudhabi,
    radius: 1000,
    types: ['cafe']
  }, callback);

}

//Function creating initial places
function callback(results, status) {
  var l=results.length;
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < l; i++) {
      createMarker(results[i]);
    }
  }
}

//Create marker for each place
function createMarker(place) {

  var marker = new google.maps.Marker({
    map: map,
    title: place.name,
    position: place.geometry.location,
  });
  initialPlaces.push(marker);
  ViewModel.markers.push(marker);
  google.maps.event.addListener(marker, 'click', function() {
    ViewModel.getPicture(marker);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    window.setTimeout(function(){
      marker.setAnimation(null);
    },timeout);
    infowindow.setContent(marker.title);
    infowindow.open(map, this);
  });
}

//Error handler for google map
function googleError(){
  alert('Requested google map failed.');
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < initialPlaces().length; i++) {
    initialPlaces()[i].setMap(map);
  }
}

//Function to make marker on the mape visioble
var makeVisible=function(marker){
  marker.setMap(map);
};

var ViewModel={
  markers: ko.observableArray(),
  query: ko.observable(),
  image: ko.observable(),

  //Filter the places in the list and on the map
  search:function(value) {
    var places=initialPlaces();
    ViewModel.markers.removeAll();
    setMapOnAll(null);
    for(var x in places) {
      if(places[x].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        ViewModel.markers.push(places[x]);
        makeVisible(initialPlaces()[x]);

      }
    }
  },

  //Display marker clicled on the list
  currentMarker:function(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    window.setTimeout(function(){
      marker.setAnimation(null);
    },timeout);
    ViewModel.getPicture(marker);
    infowindow.setContent(marker.title);
    infowindow.open(map, marker);
  },

  //Get picture of selected place from flicker
  getPicture: function (data){
  var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
    $.getJSON( flickerAPI, {
      tags: data.title,
      tagmode: "any",
      format: "json"
    })
    .done(function(data) {
      if (typeof data.items[0]=="object") {
        var ref=data.items[0].media.m
      };
      ViewModel.image(ref);
    });
    $(function(){
      $.ajaxSetup({
        function(jqXHR, exception) {
          if (jqXHR.status === 0) {
              alert('Not connect.\n Verify Network.');
          } else if (jqXHR.status == 404) {
              alert('Requested page not found. [404]');
          } else if (jqXHR.status == 500) {
              alert('Internal Server Error [500].');
          } else if (exception === 'parsererror') {
              alert('Requested JSON parse failed.');
          } else if (exception === 'timeout') {
              alert('Time out error.');
          } else if (exception === 'abort') {
              alert('Ajax request aborted.');
          } else {
              alert('Uncaught Error.\n' + jqXHR.responseText);
          }
        }
      });
    });
  }
};

ko.applyBindings(ViewModel);
ViewModel.query.subscribe(ViewModel.search);



