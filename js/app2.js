var map;
var infowindow;
var initialPlaces=ko.observableArray();

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
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
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
    infowindow.setContent(marker.title);
    infowindow.open(map, this);
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  });
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
    .fail(function( jqXHR, textStatus ) {
      console.log( "Request failed: " + jqXHR);
    })
    .done(function(data) {
      if (typeof data.items[0]=="object") {var ref=data.items[0].media.m};
      ViewModel.image(ref);
    });
  }
};

ko.applyBindings(ViewModel);
ViewModel.query.subscribe(ViewModel.search);



