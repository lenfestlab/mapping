function diplayLayer(layerId) {
  var outlineId = 'outline-' + layerId;
  map.setLayoutProperty(outlineId, 'visibility', 'visible');
  map.setLayoutProperty(layerId, 'visibility', 'visible');    
}

function addGeojson(sourceName) {
  console.log('source added!');
  // Add a data source containing GeoJSON data.
  map.addSource(sourceName, {
      'type': 'geojson',
      'data': '/data-files/' + sourceName + '.geojson'
  });
  

  // Add a new layer to visualize the polygon.
  map.addLayer({
      'id': sourceName,
      'type': 'fill',
      'source': sourceName, // reference the data source
      'layout': {},
      'paint': {
          'fill-color': '#0080ff', // blue color fill
          'fill-opacity': 0.5
      }
  });
  
  // Add a black outline around the polygon.
  var outlineId = 'outline-' + sourceName;
  map.addLayer({
      'id': outlineId,
      'type': 'line',
      'source': sourceName,
      'layout': {},
      'paint': {
          'line-color': '#000',
          'line-opacity': 0.3,

        'line-width': 1
      }
  });

  map.setLayoutProperty(outlineId, 'visibility', 'none');
  map.setLayoutProperty(sourceName, 'visibility', 'none');
}