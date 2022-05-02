function trackJumpToCounty(countyName, countyId) {
  articleIds = counter[countyId]
  count = 0
  if (articleIds) {
    count = articleIds.length
  }
    
  track('jump-to-county', 'navigation', countyName, undefined, count);
}

function loadHeader(counties) {
	
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
	
  let headerHTML = ""
        
  headerHTML = headerHTML + `
  <div class="Rectangle" data-turbolinks="false"><div class="jump">
  <div class="row">
  `
  Object.keys(stateMap).forEach(function (state) { 
      var counties = stateMap[state]
      columnLargeWidth = Math.ceil(12/Math.ceil(counties.length/3))
      columnMediumWidth = 2//Math.ceil(12/Math.ceil(counties.length/4))
      countiesHTML = ``
      counties.forEach(function (county) { 
          countiesHTML = countiesHTML + `
          <div class="col-6 col-lg-${columnLargeWidth}">
          <a class="jump" onclick="trackJumpToCounty('${county.name}', ${county.id});" href="#county-${county.id}">${county.name}</a>
          </div>`
      })
      headerHTML = headerHTML + `
      <div class="col-md-12 col-lg-6"><div><div class="row">
      <div class="col-12 state">${state}</div>${countiesHTML}</div></div></div>`
  })
  
  
  headerHTML = headerHTML + '<div class="newsletter col-md-12 col-lg-12">📬 <a target="_blank" href="https://covid-lenfest.herokuapp.com/subscriptions/new" onclick="trackSignupClick()">Sign up</a> to receive these stories by email.</div>'
  headerHTML = headerHTML + '</div></div></div>'
	
	return headerHTML
	
}