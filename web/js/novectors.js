var pointsURL = '/location-data/points.geojson'
var metaDataURL = '/location-data/metadata.csv'

loadData()

function loadData() {
    Promise.all([
        d3.csv(metaDataURL),
        d3.json(pointsURL),
    ]).then(function (results) {
        store = new DataStore(results)
        console.log('data loaded...');
        renderDropDowns()
        loadVectors()
        var center = [-75.15, 39.95]
        loadMap(center)
        initializeMap('/location-data/inquirer-polys.geojson')
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
}

function addOnClickObservers() {
}

function Article(data) {
    this.metaData = data
    this.id = data.identifier
    this.authors = [data.author]
    this.topics = []
    this.headline = data.title
    this.image = null
    this.reporter = null
}

function renderOverview(filteredData) {
    foundCount = filteredData.length
    filtersApplied = (filter.authorFilter != undefined || filter.topicFilter != undefined)
    topicHTML = renderTopicHTML(filteredData)
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