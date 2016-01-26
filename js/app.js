//Array of markers
var places_map=ko.observableArray([]);
var search=ko.observable("");

//Function to initialize map without search bar
var init_map=function(){
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 24.472221, lng: 54.328119},
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  var markers=places_map();
  markers.forEach(function(marker) {
  // make markers clickable with window
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(marker.title);
      infowindow.open(map,this);
    });
    marker.setMap(map);
  });
  return map;
};

//Function initialize map with search bar bound to it
function initAutocomplete(){
  var map=init_map();

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());

  });
  var markers = [];

  // [START region_getplaces]
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed',function(){
    var places = searchBox.getPlaces();
    if (places.length === 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();

    // Clear places array
    places_map.removeAll();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      var marker= new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      });

      //make markers clickable with window
      infowindow = new google.maps.InfoWindow();
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map,this);
      });

      // Create a marker for each place.
      markers.push(marker);
      if (place.geometry.viewport) {
      // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }

      //Add places to observable array
      places_map.push(marker);
    });
    map.fitBounds(bounds);
  });
}

//Function to add images with tag using Flickr API
var getImage=function(tag){
  var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
  $.getJSON( flickerAPI, {
    tags: tag,
    tagmode: "any",
    format: "json"
  })
  .done(function( data ) {
    $("#images").empty();
    $.each( data.items, function( i, item ) {
      $( "<img>" ).attr( "src", item.media.m ).appendTo( "#images" );
      if ( i === 2 ) {
        return false;
      }
    });
  });
};


var ViewModel=function(){
  this.setMarker=function(place){
    infowindow = new google.maps.InfoWindow();
    var map=init_map();
    infowindow.setContent(place.title);
    infowindow.open(map,place);
    getImage(place.title);
  };
};

ko.applyBindings(new ViewModel());


