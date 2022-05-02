$(document).ready(function() {
  let searchParams = new URLSearchParams(window.location.search)
    
  if (!(searchParams.has('after') && searchParams.has('before'))) {
    document.body.innerHTML = '<div class="main container"><center>An Error Occured. Missing required parameters.<center></div>' ;
    return
  }
  
  let after = searchParams.get('after')
  let before = searchParams.get('before')
  
  var county_ids = "2242%2C+2275%2C+2282%2C+1768%2C+1770%2C+1771%2C+1772%2C+1773%2C+1775%2C+1778%2C+1784%2C+2245%2C+2251%2C+2259%2C+2279%2C+2284%2C+2287"
  var base_url = "https://lenfest-mapping.herokuapp.com"
  var article_locations_url = base_url + "/collections/5/article_locations.json?after=" + after + "&before=" + before + "&county_ids=" + county_ids
  var counties_url = base_url + "/collections/5/counties.json?after=" + after + "&before=" + before + "&county_ids=" + county_ids
  
  Promise.all([
        d3.json(counties_url),
        d3.json(article_locations_url),
  ]).then(function (results) {  
    counties = results[0]
    article_locations = results[1]
    let innerHTML = ""
    let headerHTML = ""
          
    var stateMap = {};      
    counties.forEach(function(county) {
      let countyName = county.name
      let stateCode = county.state_code
      if (countyName != null & stateCode != null) {
        var counties = stateMap[stateCode]
        if (counties == null) {
          counties = []
        }
        counties.push(county)
        stateMap[stateCode] = counties;
      }
    });
          
    headerHTML = headerHTML + '<div class="feedback"><a target="_blank" href="https://docs.google.com/forms/u/0/d/1-xFOkbyPE9cmKpdGOUTfXWXP_kOfwr32z0RJnX8s_vQ/viewform?edit_requested=true">Feedback</a></div>'

    headerHTML = headerHTML + '<div class="orange"><div class="container">'
    headerHTML = headerHTML + '<div class="row">'
    Object.keys(stateMap).forEach(function (state) { 
        var counties = stateMap[state]
        headerHTML = headerHTML + '<div class="col-md-12 col-lg-6"><div class="container"><div class="row">'
        headerHTML = headerHTML + '<div class="col-12 state">' + state + '</div>' 
        columnLargeWidth = Math.ceil(12/Math.ceil(counties.length/4))
        columnMediumWidth = 2//Math.ceil(12/Math.ceil(counties.length/4))
        counties.forEach(function (county) { 
            // headerHTML = headerHTML + '<div class="col-lg-' + columnLargeWidth + ' col-md-' + columnMediumWidth + '">'
            headerHTML = headerHTML + '<div class="col-6 col-lg-' + columnLargeWidth + '">'
            headerHTML = headerHTML + '<a href="#county-' + county.id + '">' + county.name + "</a>"
            headerHTML = headerHTML + '</div>'  
        })
        headerHTML = headerHTML + '</div></div></div>' 
    })
    
    headerHTML = headerHTML + '</div></div></div>'
    
    counties.forEach(function(county) {
      
      let countyName = county.name
      let stateCode = county.state_code
      let placeName = ""
      if (countyName != null) {
        placeName = placeName + countyName + ' County'
        if (stateCode != null) {
          placeName = placeName + ", " + stateCode
        }
      }

      if (county != null) {
        innerHTML = innerHTML + '<h2 class="header" id=county-' + county.id + '>' + placeName + "</h2>"          
      }
      article_locations.forEach(function(article_location) {
        if (article_location.source_url != null && article_location.county_id == county.id) {
          dateString = new Date(article_location.published_at).toString("MMMM dS, yyyy")
          innerHTML = innerHTML + '<div class="article">'         
          innerHTML = innerHTML + '<b>' + article_location.location_name + ' &mdash; </b><a target="_blank" href="' + article_location.source_url + '">' + article_location.title + '</a>'         
          innerHTML = innerHTML + '<div class="snippet">'
          snippet = article_location.snippet
          if (snippet.length > 0) {
            innerHTML = innerHTML + '"' + article_location.snippet + '" '                                                 
          }
          innerHTML = innerHTML + dateString                       
          innerHTML = innerHTML + '</div>'                       
          innerHTML = innerHTML + '</div>'                       
        }
      });
    });
    buttonHTML = '  <button onclick="topFunction()" type="button" class="btn-jump">&#9650 Back To Top</button>'
    document.body.innerHTML = '<div class="main container">' + headerHTML + '<div class="list">' + innerHTML + '</div>' + '</div>' + buttonHTML ;
  })

});

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}