var map;
var popup;
var hoveredStateId = null;

var store;
var polygonDataStore;

function loadMap(center, bounds, zoom=10) {    
  var ver = 1.2
  var hor = 1.8

  var config = {
      container: 'map',
      style: 'mapbox://styles/ajayjapan/ck640rhf90ta91ipgh9hy8kfv',
      zoom: zoom,
      center: center,
  }
  
  if (bounds) {
    config['maxBounds'] = bounds    
  }

  map = new mapboxgl.Map(config);

  map.scrollZoom.disable();
  map.addControl(new mapboxgl.NavigationControl());
  
  // Create a popup, but don't add it to the map yet.
  popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false
  });
}

function applyFilters() {
    filter.update()

    var pointsArticleIds = store.filteredPointsData(filter).flatMap(f => f.properties.articles)
    var metaArticleIds = store.filteredMetadata(filter)
    var articleIds = metaArticleIds.filter(value => pointsArticleIds.includes(value));
    var filteredData = store.articles.filter(function(article) {    
      return articleIds.includes(article['id'])
    });
        
    renderOverview(filteredData)
    renderList(filteredData)
        
    if (filter.active()) {
        var filterArray = ["all"]
        
        let countyFilter = filter.countyFilter
        if (countyFilter.active()) {
          filterArray.push(['==', countyFilter.value, ['get', 'GEOID-CO']])
        }
        
        let censusFilter = filter.censusFilter
        if (censusFilter.active()) {
          filterArray.push(['==', censusFilter.value, ['get', 'GEOID-CT']])
        }
        
        let neighborhoodFilter = filter.neighborhoodFilter
        if (neighborhoodFilter.active()) {
          filterArray.push(['==', neighborhoodFilter.value, ['get', 'GEOID-NH']])
        }
                
        var filterArticlesArray = ["any"].concat(articleIds.map(id => ['in', id, ['get', 'articles']]))
        
        filterArray.push(filterArticlesArray)
        
        map.setFilter('points', filterArray);
        map.setFilter('point-heatmap', filterArray);
    } else {
        map.setFilter('points', null);
        map.setFilter('point-heatmap', null);
    }
    
    if (countiesLayer) {
      setStates(countiesLayer, articleIds);      
    }
    if (censusLayer) {
      setStates(censusLayer, articleIds);      
    }
    if (neighborhoodsLayer) {
      setStates(neighborhoodsLayer, articleIds);      
    }
}

function renderDropDown(array, key) {
  list = $("select." + key + "-menu");

  array.sort().forEach(function display(value1, value2, set) {
      var txt1 = '<option value="' + value1 + '">' + value1 + '</option>'; // Create element with HTML 
      list.append(txt1);
  })
}

var topicsDictionary = {}
var authorsDictionary = {}

function updateOverview() {
  var articleIds = store.filteredMetadata(filter)
  var filteredData = store.articles.filter(function(article) {    
    return articleIds.includes(article['id'])
  });
  renderOverview(filteredData)
  renderList(filteredData)
}

function renderDropDownsFromAPI(results) {
  
    data = results[2]
    var list = $("select.topic-menu");
    data.sort().forEach(function display(element) {
        topicsDictionary[element['id']] = element['name']
        var txt1 = '<option value="' + element['id'] + '">' + element['name'] + '</option>'; // Create element with HTML 
        list.append(txt1);
    });
    
    data = results[3]
    var list = $("select.authors-menu");
    data.sort().forEach(function display(element) {
        authorsDictionary[element['id']] = element['name']
        var txt1 = '<option value="' + element['id'] + '">' + element['name'] + '</option>'; // Create element with HTML 
        list.append(txt1);
    });
    
    data = results[4]
    var list = $("select.counties-menu");
    data.sort().forEach(function display(element) {
        var txt1 = '<option value="' + element['geoid'] + '">' + element['name'] + '</option>'; // Create element with HTML 
        list.append(txt1);
    });
    
    data = results[5]
    var list = $("select.census_tracts-menu");
    data.sort().forEach(function display(element) {
        var txt1 = '<option value="' + element['geoid'] + '">' + element['name'] + '</option>'; // Create element with HTML 
        list.append(txt1);
    });
    
    data = results[6]
    var list = $("select.neighborhoods-menu");
    data.sort().forEach(function display(element) {
        var txt1 = '<option value="' + element['geoid_nh'] + '">' + element['listname'] + '</option>'; // Create element with HTML 
        list.append(txt1);
    });
    
    updateOverview()
    
}

function renderList(data) {

    list = $("div.list-group");
    list.empty()

    for (var i = 0; i < data.length; i++) {
        article = data[i];
                
        var txt1 = `<a target="_blank" href="` + article.website + `" class="list-group-item list-group-item-action">`
        txt1 += `<div class="container">`
        txt1 += `<div class="row">`
        txt1 += `<div class="col-12">`
        txt1 += `<div class="p-2">`
        txt1 += `<div class="d-flex w-100 justify-content-between">`
        txt1 += `<h5 class="mb-1">` + article.headline + `</h5>`
        txt1 += `<small>` + new Date(article.publishedAt).toLocaleDateString() + `</small>`
        txt1 += `</div>`
        txt1 += `<p>` + article.id + `</p>`
        txt1 += `<small>` + article.author_ids.map(id => authorsDictionary[parseInt(id)]) + `</small>`;
        txt1 += `</div>`
        txt1 += `</div>`
        txt1 += `</div>`
        txt1 += `</div>`
        txt1 += `</a>`

        list.append(txt1);
    }
}

function renderCategoryHTML(filteredData, key, dictionary) {
    totalCount = 0
    list = []
    for (var i = 0; i < filteredData.length; i++) {
        article = filteredData[i]
        list = list.concat(article[key])
        totalCount++
    }

    text = ""
    uniqueList = [...new Set(list)]
    for (var i = 0; i < uniqueList.length; i++) {
        count = 0
        for (var j = 0; j < list.length; j++) {
            if (uniqueList[i] == list[j]) {
                count++
            }
        }
        title = dictionary[parseInt(uniqueList[i])]
        text = text + " <b>" + title + "</b> (" + count + '/' + totalCount + '=' +  Math.round(count*100/totalCount)  + '%),'
    }
    return text
}

function renderDateHTML(filteredData) {
    date = "All"
    if (!isNaN(filter.toFilter) || !isNaN(filter.fromFilter)) {
        filtersApplied = true
        var options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        date = ""
        if (!isNaN(filter.fromFilter)) {
            date = date + " From " + filter.fromFilter.toLocaleDateString("en-US", options)
        }

        if (!isNaN(filter.toFilter)) {
            date = date + " Till " + filter.toFilter.toLocaleDateString("en-US", options)
        }
    }

    dateHTML = `<li>Date:` + date + `</li>`
    return dateHTML
}

function renderMap(polys_source) {
  map.addSource('points_source', {
      type: 'geojson',
      data: store.localPointsData
  });

  map.addLayer(
    {
      id: 'points',
      type: 'circle',
      source: 'points_source',
      minzoom: 14,
      paint: {
        // increase the radius of the circle as the zoom level and dbh value increases
        'circle-radius': {
          property: 'dbh',
          type: 'exponential',
          stops: [
            [{ zoom: 15, value: 1 }, 5],
            [{ zoom: 15, value: 62 }, 10],
            [{ zoom: 22, value: 1 }, 20],
            [{ zoom: 22, value: 62 }, 50]
          ]
        },
        'circle-color': {
          property: 'dbh',
          type: 'exponential',
          stops: [
            [0, 'rgba(236,222,239,0)'],
            [10, 'rgb(236,222,239)'],
            [20, 'rgb(208,209,230)'],
            [30, 'rgb(166,189,219)'],
            [40, 'rgb(103,169,207)'],
            [50, 'rgb(28,144,153)'],
            [60, 'rgb(1,108,89)']
          ]
        },
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        'circle-opacity': {
          stops: [
            [14, 0],
            [15, 1]
          ]
        }
      }
    },
    'waterway-label'
  );
  
  
  map.addLayer({
      id: 'point-heatmap',
      type: 'heatmap',
      source: 'points_source',
      maxzoom: 15,
      paint: {
        // increase weight as diameter breast height increases
        'heatmap-weight': {
          property: 'dbh',
          type: 'exponential',
          stops: [
            [1, 0],
            [62, 1]
          ]
        },
        // increase intensity as zoom level increases
        'heatmap-intensity': {
          stops: [
            [11, 1],
            [15, 3]
          ]
        },
        // assign color values be applied to points depending on their density
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(236,222,239,0)',
          0.2,
          'rgb(208,209,230)',
          0.4,
          'rgb(166,189,219)',
          0.6,
          'rgb(103,169,207)',
          0.8,
          'rgb(28,144,153)'
        ],
        
        // increase radius as zoom increases
        'heatmap-radius': {
          stops: [
            [11, 15],
            [15, 20]
          ]
        },
        // decrease opacity to transition into the circle layer
        'heatmap-opacity': {
          default: 1,
          stops: [
            [14, 1],
            [15, 0]
          ]
        }
      }
    });
  

  if (polys_source != null) {
      map.addSource('polys_source', {
          type: 'geojson',
          data: polys_source
      });      

	  map.addLayer({
	      'id': 'polys',
	      'type': 'fill',
	      'source': 'polys_source',
	      'paint': {
	          'fill-color': 'rgba(255, 0, 0, 0.0)',
	          'fill-outline-color': 'rgba(0, 255, 0, 1)'
	      },
	      'layout': {
	          'visibility': 'visible',
	      },
	  });
  }

}

function displayPopup(geoName, geoId, layerData, coordinates) {
    numPoints = 0

    featureState = map.getFeatureState({
        source: layerData.layerSource,
        id: geoId,
    })

    numPolys = featureState['count']
    pointsCount = 0
    var htmlContent = ''
    htmlContent = htmlContent + geoName
    htmlContent = htmlContent + '<br> Number of points:' + pointsCount
    htmlContent = htmlContent + '<br> Number of polys: ' + numPolys

    popup.setLngLat(coordinates)
        .setHTML(htmlContent)
        .addTo(map);
}

function addLayers(visibleLayerName) {
    layers.forEach(function(layer) {
    visibility = 'none'
    if (layer.id == visibleLayerName) {
        visibility = 'visible'
    }
    
    layout = { 'visibility': visibility }
    addLayer(layer, layout)
  });
}

function addLayerControls(visibleLayerName) {

    var controls = document.getElementById('layer-controls')
    controls.innerHTML = ''

    layers.forEach(function(layer) {
      var e = document.createElement('div');
      innerHTML = '';
      innerHTML += '<div class="custom-control custom-radio">';
      innerHTML += `<input type="radio" class="custom-control-input" id="` + layer.id + `" name="defaultExampleRadios" onclick='showLayer("` + layer.id + `")' `;
      if (layer.id == visibleLayerName) {
          innerHTML += `checked>`;
      } else {
          innerHTML += `>`;          
      }
      innerHTML += `<label class="custom-control-label" for="` + layer.id + `">` + layer.title + `</label>`;
      innerHTML += '</div>';
      e.innerHTML = innerHTML;
      while(e.firstChild) {
          controls.appendChild(e.firstChild);
      }
    });
}

function initializeMap(collection_id, polys_source) {
		
  	if (map.loaded()) {
  		onMapLoad(polys_source);
  	} else {
  	    map.on('load', function () {
  	        onMapLoad(polys_source);
  	    });		
  	}

    addOnClickObservers()

    map.on('mouseenter', 'points', function (e) {
        // Change the cursor style as a UI indicator.
        var feature = e.features[0]
        var coordinates = feature.geometry.coordinates.slice();
        var src = "https://lenfest-mapping.herokuapp.com/collections/" + collection_id + "/locations/" + feature.id
        var htmlContent = '<iframe style="width: 100%; height: 100%; margin: none; padding: none; border: none;" src="' + src + '"></iframe>';

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates)
            .setHTML(htmlContent)
            .addTo(map);

    });
}