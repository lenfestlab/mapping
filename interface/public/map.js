var bounds;

function setPlace(map, place_name, loc, viewport) {
  // For each place, get the icon, name and location.
  
  if (!loc) {
    console.log("Returned place contains no geometry");
    return;
  }

  const icon = {
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25),
  };
  
  var mIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillOpacity: 1,
    fillColor: '#fff',
    strokeOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#333',
    scale: 12
  };

  var gMarker = new google.maps.Marker({
    map: map,
    position: loc,
    title: place_name,
    icon: mIcon,
    label: {color: '#000', fontSize: '12px', fontWeight: '600',
      text: place_name}
  });
  
  markers.push(gMarker)

  if (viewport) {
    // Only geocodes have viewport.
    bounds.union(viewport);
  } else {
    bounds.extend(loc);
  }
}

function clearMarker() {
  // Clear out the old markers.
  markers.forEach((marker) => {
    marker.setMap(null);
  });
  markers = [];
}

let markers = [];

function search(searchBox, map) {
  const places = searchBox.getPlaces();

  if (places.length == 0) {
    return;
  }

  // Clear out the old markers.
  markers.forEach((marker) => {
    marker.setMap(null);
  });
  markers = [];

  // For each place, get the icon, name and location.
  const bounds = new google.maps.LatLngBounds();

  places.forEach((place) => {
    if (!place.geometry || !place.geometry.location) {
      console.log("Returned place contains no geometry");
      return;
    }

    const icon = {
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25),
    };

    // Create a marker for each place.
    markers.push(
      new google.maps.Marker({
        map,
        icon,
        title: place.name,
        position: place.geometry.location,
      })
    );
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  });
  map.fitBounds(bounds);
}

function initMap() {
  var mapProp= {
    center:new google.maps.LatLng(51.508742,-0.120850),
    zoom:5,
  };
  var map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}