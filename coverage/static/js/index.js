
function loadData(collectionId, center, maxBounds, title, pointsURL) {  
    loadMap(center, maxBounds=maxBounds)
    Promise.all([
        getAllArticles(collectionId),
        getAllFeatures(pointsURL),
        getTopics(collectionId),
        getAuthors(collectionId),
        getCounties(collectionId),
        getCensusTracts(collectionId),
        getNeighborhoods(collectionId),
    ]).then(function (results) {  
      $('.header').text(title)
      store = new DataStore(results[0], results[1])
      console.log('data loaded...');
      
      filter.append();
      
      loadVectors()
      initializeMap(collectionId)
      renderDropDownsFromAPI(results);      
    });
}

function onMapLoad(polys_source) {
    renderMap(polys_source);
    visibleLayerName = "neighborhoods";
    addLayers(visibleLayerName);
    addLayerControls(visibleLayerName);    
}

function loadVectors() {
  neighborhoodsLayer = null
  countiesLayer = null
  censusLayer = null
  
  neighborhoodsLayer = new Layer("Philadelphia Neighborhoods", "neighborhoods_source", "neighborhoods", "GEOID-NH", 'https://lenfest-mapping.herokuapp.com/Geography/neighborhoods.geojson', 10)
  layers.push(neighborhoodsLayer)

  countiesLayer = new Layer("Counties", "counties_source", "counties", "GEOID-CO", 'https://lenfest-mapping.herokuapp.com/Geography/counties.geojson', 7)
  layers.push(countiesLayer)

  censusLayer = new Layer("Census Tracts", "census_source", "census", "GEOID-CT", 'https://lenfest-mapping.herokuapp.com/Geography/censustracts.geojson', 7)
  layers.push(censusLayer)
}

function addOnClickObservers() {
}

function renderOverview(filteredData) {
    foundCount = filteredData.length
    filtersApplied = (filter.authorFilter != undefined || filter.topicFilter != undefined)
  
    topicHTML = `<li> Topics: ` + renderCategoryHTML(filteredData, "topic_ids", topicsDictionary)  + `</li>`
    dateHTML = renderDateHTML(filteredData)
    authorHTML = `<li> Authors: ` + renderCategoryHTML(filteredData, "author_ids", authorsDictionary)  + `</li>`
    filtersAppliedText = "<h5>No filters applied</h5>"
    if (filtersApplied) {
        filtersAppliedText = ""
    }
    locationHTML = `<li>Location: All</li>`
    results = `<h4>Results Overview</h4>` + filtersAppliedText + `<p></p>Total ` + foundCount + ` results</p>
    <div class="entry-content"><ul>` + topicHTML + authorHTML + dateHTML + locationHTML + `</ul></div>`
    $('div.results-overview').empty()
    $('div.results-overview').append(results);
}