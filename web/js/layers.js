function Layer(title, source, id, key, dataSource, zoom) {
  this.source = source;
  this.id = id;
  this.key = key;
  this.dataSource = dataSource;
  this.data;
  this.zoom = zoom
  this.legend = id + '-legend'
  this.title = title
}

function showLayer(layerName) {
    layers.forEach(function(layer) { 
        visibility = 'none'
        display = 'none'
        if (layer.id == layerName) {
            visibility = 'visible'
            display = 'block'
            map.zoomTo(layer.zoom, { duration: 900 })
        }
        map.setLayoutProperty(layer.id, 'visibility', visibility);
        document.getElementById(layer.legend).style.display = display;
    });  
}

var layers = []

var colors = ['#edf8e9','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32']

function getColor(array, colors) {
    var stops = []
    for (idx in array) {
      stops.push([array[idx][0], colors[idx]])
    }
    return stops
}

function layerPaint(layer, stops) {
    var interpolate = ['interpolate', ['linear'], ['feature-state', 'total']]
    for (idx in stops) {
      var step = stops[idx]
      interpolate.push(step[0])
      interpolate.push(step[1])
    }
    
    property = ['case',
          ['!=', ['feature-state', 'count'], null],
          interpolate,
          'rgba(255, 255, 0, 0)'
        ]
    
    map.setPaintProperty(layer.id, 'fill-color', property);
}

function usePropertyAsId(propertyKey, originalData) {
    features = originalData.features

    var idfeatures = [];
    for (var i = 0; i < features.length; i++) {
        var row = {}
        row.type = features[i].type
        row.properties = features[i].properties
        row.geometry = features[i].geometry
        row.id = features[i].properties[propertyKey].toString()
        idfeatures.push(row)
    }

    originalData.features = idfeatures
    return originalData
}

function updateLegend(layer, polyCount, articleIds) {
  
  var layerData = layer.data
  polyLayerCount = polyCount[layer.key]
  array = []
  var features = layerData.features
  for (row in features) {
    var feature = features[row]
    var geoId = parseInt(feature.id)
    var pointsCount = store.getPointsCount(geoId, layer.key, filter, articleIds)
    var layerCount = 0
    if (polyLayerCount[geoId]) {
      var articles = articleIds.filter(x => polyLayerCount[geoId].includes(x))
      layerCount = articles.length  
    }
    var combinedCount = layerCount + pointsCount
    array.push(combinedCount)
  }
  clusters = ss.ckmeans(array, Math.min(array.length, 7));
  var stops = getColor(clusters, colors)

  var elementId = layer.id + '-legend'
  var legend = document.getElementById(elementId)
  legend.innerHTML = ''
  
  for (idx in stops) {
    var step = stops[idx]     
    var e = document.createElement('div');
    e.innerHTML = '<div><span style="background-color: '+step[1]+'"></span>'+step[0]+'</div>';        
    while(e.firstChild) {
        legend.appendChild(e.firstChild);
    }
  }
  
  layerPaint(layer, stops)
}

function addLayer(layer, layout) {
    d3.json(layer.dataSource).then(function (data) {
        
        layer.data = usePropertyAsId(layer.key, data)   
        map.addSource(layer.source, {
            type: 'geojson',
            data: layer.data,
        });

        var mapboxLayer = {
            'id': layer.id,
            'type': 'fill',
            'source': layer.source,
            'paint': {
              'fill-opacity': 0.5,
              'fill-outline-color': '#000'
            },
            'layout': layout,
        }

        map.addLayer(mapboxLayer, 'points');
        
        setStatesAfterLoad(map, layer)

    });
}

function setStatesAfterLoad(map, layer) {
  function setAfterLoad(e) {
      if (e.sourceId === layer.source && map.isSourceLoaded(layer.source)) {
          if (setStates(layer)) {
            map.off('sourcedata', setAfterLoad);
          }
          
      }
  }

  if (map.isSourceLoaded(layer.source)) {
      setStates(layer);
  } else {
      map.on('sourcedata', setAfterLoad);
  }
}

function setStates(layer) {
    var features = map.querySourceFeatures(layer.source)

    if (features.length == 0) {
      return
    }

    var articleIds = store.filteredMetadata(filter).map(a => a['id'])
    var polyCount = store.polyDataCount
    polyLayerCount = polyCount[layer.key]

    for (row in features) {
        feature = features[row]
        if (feature) {
            var geoId = parseInt(feature.id)            
            var pointsCount = store.getPointsCount(geoId, layer.key, filter, articleIds)
            var layerCount = 0
            if (polyLayerCount[geoId]) {
              var articles = articleIds.filter(x => polyLayerCount[geoId].includes(x))
              layerCount = articles.length   
            }
            var combinedCount = layerCount + pointsCount

            map.setFeatureState({
                source: layer.source,
                id: feature.id,
            }, {
                count: layerCount,
                points_count: pointsCount,
                total: combinedCount,
            });

        }
    }

    updateLegend(layer, polyCount, articleIds)

    return features.length > 0
}
