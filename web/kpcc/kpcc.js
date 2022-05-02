
var pointsURL = "Output/points.geojson"
var metaDataURL = "LocationData/metadata.csv"

loadData()

function loadData() {
    Promise.all([
        d3.csv(metaDataURL),
        d3.json(pointsURL),
        d3.csv("/location-data/inquirer-polys.csv")
    ]).then(function (results) {  
        store = new DataStore(results)
        polygonDataStore = new PolygonDataStore(results[2])
        console.log('data loaded...');
        renderDropDowns()
        loadVectors()
        zoom = 10
        if (layers.length > 0) {
          zoom = layers[0].zoom
        }
        var center = [-118.131943, 34.056113]
        loadMap(center, zoom=zoom)
        initializeMap('Output/polys.geojson')
        filteredData = store.filteredMetadata(filter)
        renderOverview(filteredData)
        renderList(filteredData)
    });
}

function onMapLoad(polys_source) {
    renderMap(polys_source);
    visibleLayerName = "neighborhoods";
    addLayers(visibleLayerName);
    addLayerControls(visibleLayerName);    
}

function loadVectors() {
  neighborhoodsLayer = new Layer("Neighborhoods", "neighborhoods_source", "neighborhoods", "GEOID-NH", 'Geography/neighborhoods.geojson', 7)
  layers.push(neighborhoodsLayer)  

  countiesLayer = new Layer("Counties", "counties_source", "counties", "GEOID-CO", 'Geography/counties.geojson', 6)
  layers.push(countiesLayer)

  censusLayer = new Layer("Census Tracts", "census_source", "census", "GEOID-CT", 'Geography/censustracts.geojson', 7)
  layers.push(censusLayer)
}

function addOnClickObservers() {

  map.on('click', 'neighborhoods', function (e) {
      var layerData = {
          layerId: "neighborhoods",
          layerKey: "GEOID-NH",
          layerSource: "neighborhoods_source",
      }
      var geoId = e.features[0].id.toString()
      var coordinates = e.lngLat;
      var geoName = e.features[0].properties["display_na"]
      displayPopup(geoName, geoId, layerData, coordinates)
  });

  map.on('click', 'census', function (e) {
      var layerData = {
          layerId: "census",
          layerKey: "GEOID-CT",
          layerSource: "census_source",
      }
      var geoId = e.features[0].id.toString()
      var coordinates = e.lngLat;
      var geoName = e.features[0].properties["NAMELSAD"]
      displayPopup(geoName, geoId, layerData, coordinates)
  });

  map.on('click', 'counties', function (e) {
      var layerData = {
          layerId: "counties",
          layerKey: "GEOID-CO",
          layerSource: "counties_source",
      }
      var geoId = e.features[0].id.toString()
      var coordinates = e.lngLat;
      var geoName = e.features[0].properties["NAME"]
      displayPopup(geoName, geoId, layerData, coordinates)
  });

}

function Article(data) {
    this.metaData = data
    this.id = data.identifier
    this.authors = [data.author]
    this.topics = []
    this.headline = data.title
    this.publishedAt = data.published_at
    this.website = data.source_url
    this.reporter = data.info.reporter
    this.people = []
}

function renderOverview(filteredData) {
    foundCount = filteredData.length
    filtersApplied = (filter.authorFilter != undefined || filter.topicFilter != undefined)
    topicHTML = ""
    dateHTML = renderDateHTML(filteredData)
    authorHTML = renderAuthorsHTML(filteredData)
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