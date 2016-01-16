var places_map=ko.observableArray([]);

function initAutocomplete(){
	var map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 24.472221, lng: 54.328119},
    	zoom: 13,
    	mapTypeId: google.maps.MapTypeId.ROADMAP
  	});
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

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
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

      places_map.push(place);

    });

    map.fitBounds(bounds);
  });
}






var ViewModel=function(){
	var self=this;


	this.search=ko.observable("");
	//this.map_filter=ko.observable("");
	this.search.subscribe(function(text){

	//	self.map_filter(text);
		console.log(text);

	});

	//places_map.forEach(function(data){

	//		self.places.push(new Place(data));
			//console.log(name);

	//});
}

ko.applyBindings(new ViewModel());


