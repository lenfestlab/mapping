mapboxgl.accessToken = 'pk.eyJ1IjoiYWpheWphcGFuIiwiYSI6ImNsMm9kOXEyczJhdDQzbHFoZzE5cXN6Y2IifQ.toEZCBoITl_mwr-2NqwbyQ';

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

    filteredData = store.filteredMetadata(filter)
    renderOverview(filteredData)
    renderList(filteredData)
        
    if (filter.active()) {
        var articleIds = filteredData.map(a => a['id'])
        let filter = ["any"].concat(articleIds.map(id => ['in', id, ['get', 'articles']]))
        map.setFilter('points', filter);
    } else {
        map.setFilter('points', null);
    }
    
    if (countiesLayer) {
      setStates(countiesLayer);      
    }
    if (censusLayer) {
      setStates(censusLayer);      
    }
    if (neighborhoodsLayer) {
      setStates(neighborhoodsLayer);      
    }
}

function renderDropDown(array, key) {
  list = $("select." + key + "-menu");

  array.sort().forEach(function display(value1, value2, set) {
      var txt1 = '<option value="' + value1 + '">' + value1 + '</option>'; // Create element with HTML 
      list.append(txt1);
  })
}

function renderDropDowns() {
  
    filter.append();
  
    topicList = $("select.reporter-menu");

    Array.from(store.reporters).sort().forEach(function display(value1, value2, set) {
        var txt1 = '<option value="' + value1 + '">' + value1 + '</option>'; // Create element with HTML 
        topicList.append(txt1);
    })

    renderDropDown(Array.from(store.reporters), "reporter")    
    renderDropDown(Array.from(store.topics), "topic")    
    renderDropDown(Array.from(store.authors), "authors")    
    renderDropDown(Array.from(store.genders), "gender")    
    renderDropDown(Array.from(store.races), "race")
    renderDropDown(Array.from(store.counties), "counties")
    renderDropDown(Array.from(store.census_tracts), "census_tracts")
    renderDropDown(Array.from(store.neighborhoods), "neighborhoods")
    
}

function articleIsOfTopic(article, topic) {
    return article.topics.indexOf(topic) > -1
}

function renderList(data) {

    list = $("div.list-group");
    list.empty()

    for (var i = 0; i < data.length; i++) {
        article = data[i];
                
        var txt1 = `<a target="_blank" href="` + article.website + `" class="list-group-item list-group-item-action">`
        txt1 += `<div class="container">`
        txt1 += `<div class="row">`
        if (article.image) {
            txt1 += `<div class="col-2">`
            txt1 += `<img src="` + article.image + `" alt="..." class="img-thumbnail">`
            txt1 += `</div>`
            txt1 += `<div class="col-10">`
        } else {
            txt1 += `<div class="col-12">`
        }
        txt1 += `<div class="p-2">`
        txt1 += `<div class="d-flex w-100 justify-content-between">`
        txt1 += `<h5 class="mb-1">` + article.headline + `</h5>`
        txt1 += `<small>` + new Date(article.publishedAt).toLocaleDateString() + `</small>`
        txt1 += `</div>`
        txt1 += `<p>` + article.id + `</p>`
        txt1 += `<p>` + article.topics + `</p>`
        txt1 += `<small>` + article.authors + `</small>`;
        txt1 += `</div>`
        txt1 += `</div>`
        txt1 += `</div>`
        txt1 += `</div>`
        txt1 += `</a>`

        list.append(txt1);
    }
}

function isFiltered() {
  return authorFilter != undefined || topicFilter != undefined || !isNaN(toFilter) || !isNaN(fromFilter)
}

function renderTopicHTML(filteredData) {
    return renderCategoryHTML(filteredData, "topics")
}

function renderCategoryHTML(filteredData, key) {
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
        text = text + " <b>" + uniqueList[i] + "</b> (" + count + '/' + totalCount + '=' +  Math.round(count*100/totalCount)  + '%),'
    }
    return `<li>` + key + `: ` + text + `</li>`
}

function renderAuthorsHTML(filteredData) {
    key = "authors"
    return renderCategoryHTML(filteredData, key)
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

  map.addLayer({
      'id': 'points',
      'type': 'circle',
      'source': 'points_source',
      'paint': {
          'circle-radius': {
              'base': 1,
              'stops': [[14, 2], [22, 30]]
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
    pointsCount = featureState['points_count']
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

function initializeMap(polys_source) {
		
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
        var properties = feature.properties
        var coordinates = feature.geometry.coordinates.slice();
        var beat = properties.topics;
        var headline = properties.headline;
        var website = properties.website;
        var storydate = properties.storydate;
        try {
            var articleIds = JSON.parse(properties.articles);
        } catch(e) {
            var articleIds = [properties.articles];
        }
        var count = 0;
        var location_id = e.features[0].properties.id;
        var location_formatted = e.features[0].properties.formatted_address;
        var htmlContent = '';
        // console.log(count);
				
        htmlContent = htmlContent + '<strong>Location Searched:</strong> ' + location_id + '<br>';
        htmlContent = htmlContent + '<strong>Location Returned:</strong> ' + location_formatted + '<br>';
				for (idx in articleIds) {
          articleId = articleIds[idx]
          article = store.articleIDMapping[articleId]
					if (article) {
	          let headline = article.headline;
	          let storydate = article.storydate;
	          let beat = article.topics;
	          let website = article.website;
	          htmlContent = htmlContent + '<br><a href="' + website + '" alt="url" target="_blank">' + headline + '</a></strong><br><i>Filed on ' + storydate + '</i><br>' + beat + '<br>';
            let comment = article.comment
            if (comment) {
  	          htmlContent = htmlContent + '<br>' + comment + '<br>';
            }
            
            table = '<table>';              
            for (var j = 0; j < article.people.length; j++) {
              let person = article.people[j]
              table += '<tr><td>' + person.name + '</td><td>' + person.race + '</td><td>' + person.gender + '</td></tr>';
            }
            table += '</table><br>';
            htmlContent = htmlContent + table
            
            // let dictionary = article.metaData.info
            // if (dictionary) {
            //   table = '<table>';
            //   Object.keys(dictionary).forEach(function(key) {
            //       console.log(key, dictionary[key]);
            //       table += '<tr><td>' + key + '</td>' + '<td>' + dictionary[key] + '</td></tr>';
            //   });
            //   table += '</table><br>';
            //   htmlContent = htmlContent + table
            // }
            
            count++
					} else {
						console.log('missing article with id: ' + articleId)
					}
				}
        
        htmlContent = count + ' stories at this location<br>' + htmlContent;
        

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
