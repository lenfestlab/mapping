function trackSpotlightClick(countyName, link) {
  track('spotlight-click', 'navigation', link, countyName)
}

function statistics(county, placeKey) {
  let placeName = placeNameForCounty(county, includeState=false)
  var signupCopy = ``
  if (county.state_code == 'PA') {
    link = 'https://www.spotlightpa.org/newsletters/covid?utm_source=lenfest_covid_local&utm_medium=email&utm_campaign=covid_alert_promo'
    signupCopy = `<a onclick="trackSpotlightClick('${county.name}', '${link}')" target="_blank" href="${link}">Sign up</a> for free weekly email alerts with the latest COVID-19 data for ${placeName}, a public service from Spotlight PA.`
  } else {
    link = 'https://www.spotlightpa.org/news/2020/03/pa-coronavirus-updates-cases-map-live-tracker/'
    signupCopy = `To view more COVID-19 data for ${placeName}, visit this <a onclick="trackSpotlightClick('${county.name}', '${link}')" target="_blank" href="${link}">tracking dashboard</a>, a public service from Spotlight PA.`
  }
	return `
		  <div class="statistics container ${placeKey}">
		    <div class="row">
		    <div class="col-6 stat-box">
		      <div class="stat-title">PAST 14-DAY TREND</div>
		      <div class="stat-trend">Loading...</div>
		    </div>
		    <div class="col-6 stat-box">
  		    <div class="stat-graph">
  		      <div class="stat-title">DAILY CASES TREND</div>
  					<div>
  		      <canvas id="chart" style="height:62px;"></canvas>
  					</div>
  		    </div>
		    </div>
		    <div class="col-12 stat-signup">
					${signupCopy}
		    </div>
		    </div>
			</div>
	`
}

function trackOpenArticle(source_url, countyName, neighborhoodId, neighborhoodName) {  
  var key = '#neighborhood-'+ neighborhoodId + ' .articles'
  addedArray = pageMap[key]
  neighborhoodArticleCount = ''
  if (addedArray) {
    neighborhoodArticleCount = addedArray.length
  }
  track('open-article', 'navigation', source_url, countyName, neighborhoodArticleCount, neighborhoodName)
}

function summary(county, article_location, edit, neighborhood) {
  location_name = article_location.location_name
  dateString = new Date(article_location.published_at).toString("MMMM dS, yyyy")
  
  snippet = article_location.snippet
  if (snippet.length > 0) {
    start = snippet.indexOf(location_name)
    if (start > 0) {
      end = start + location_name.length
      snippet =  snippet.substring(0, start) + "<b>" + location_name + "</b>" + snippet.substring(end);                
    }
    snippet = '"' + snippet + '" '                                                 
  }
  
  editHTML = ""
  if (edit) {
      editHTML = ` <a target="_blank" href="https://lenfest-mapping.herokuapp.com/article_locations/${article_location.id}/edit"> Edit </a>`                       
  }

row = ``
  if (article_location.thumbnail) {
      let thumbnail = article_location.thumbnail
      if (thumbnail.startsWith("/")) {
        thumbnail = "https://www.inquirer.com" + thumbnail
      }

      row = row + `
          <div class="col-md-2 col-12 imageContainer" style="background-image: url(${thumbnail});">
          </div>
          <div class="article-text col-md-10 col-12">
      `
                    
  } else {
      row = row + `
        <div class="article-text col-12">
		`
  }
	
  var listname = ''
  var neighborhoodId = 0
  if (neighborhood) {
    listname = neighborhood.listname
    neighborhoodId = neighborhood.id
  }
  
	row = row + `
          <b>${location_name} &mdash; </b>
          <a class="story-link" onclick="trackOpenArticle('${article_location.source_url}', '${county.name}', '${neighborhoodId}', '${listname}')" target="_blank" href="${article_location.source_url}">${article_location.title}</a>
          <div class="snippet"><i>${snippet}</i> ${dateString}</div>
         ${editHTML}</div>							
	`
	return `<div class="container article"><div class="row">${row}</div></div>`
}

function loadPage(counties, article_locations, edit) {

  let innerHTML = ""
  let headerHTML = loadHeader(counties)
      
  counties.forEach(function(county) {
        
  	let placeName = placeNameForCounty(county)      
  	let placeKey = placeKeyForCounty(county)
	  
    innerHTML = innerHTML + '<div class="county" id=county-' + county.id + '>'          
    innerHTML = innerHTML + '<h4 class="header">' + placeName + "</h4>"          	  
    
    innerHTML = innerHTML + statistics(county, placeKey)          
				
    innerHTML = innerHTML + '<div class="other"><div class="articles"></div></div>'
		
	  county.neighborhoods.forEach(function(neighborhood) {
      	  
	    innerHTML = innerHTML + '<div class="neighborhood" id=neighborhood-' + neighborhood.id + '>'          
	    innerHTML = innerHTML + '<h5 class="header">' + neighborhood.listname + " Stories</h5>"
	    innerHTML = innerHTML + '<div class="articles"></div>'
	    innerHTML = innerHTML + '</div>'
		
	  });
		
    innerHTML = innerHTML + '</div>'
		
  });
  
  explanationHTML = '<div class="explanation-bold">'
  explanationHTML = explanationHTML + '💉 Learn more about local vaccine rollout with the Inquirer’s'
  explanationHTML = explanationHTML + ' <a target="_blank" onclick="trackVaccineResourceTool()" href="https://www.inquirer.com/health/coronavirus/a/covid-19-vaccine-registration-philadelphia-new-jersey-20210120.html">vaccine look-up tool</a>'
  explanationHTML = explanationHTML + ' and its 💬 vaccine'
  explanationHTML = explanationHTML + ' <a target="_blank" onclick="trackVaccineResourceInfo()" href="https://www.inquirer.com/health/coronavirus/inq/coronavirus-covid19-vaccine-frequently-asked-questions-20201219.html">Q&A page</a>.</div>'
  
  var mainHTML = headerHTML + explanationHTML + '<div class="list">' + innerHTML + '</div>' 
      
  $('div.content').html(mainHTML);
  
  loadMaps()
    
  var countyMap = {};
    counties.forEach(function(county) {
    countyMap[county.id] = county
  });
  
  var addedMap = {}
  counter = {}
  article_locations.forEach(function(article_location) {
    if (article_location.neighborhood_id) {
      var key = '#neighborhood-'+ article_location.neighborhood_id + ' .articles'
      var addedArray = !addedMap[key] ? [] : addedMap[key]
      addedArray.push(article_location.article_id)
      addedArray = _.uniq(addedArray)
      addedMap[key] = addedArray
    }
    else if (article_location.county_id) {
      var key = '#county-'+ article_location.county_id + ' .other .articles'
      var addedArray = !addedMap[key] ? [] : addedMap[key]
      addedArray.push(article_location.article_id)
      addedArray = _.uniq(addedArray)
      addedMap[key] = addedArray
    }
    if (article_location.county_id) {
      var key = article_location.county_id
      var addedArray = !counter[key] ? [] : counter[key]
      addedArray.push(article_location.article_id)
      addedArray = _.uniq(addedArray)
      counter[key] = addedArray
    }
  });
    
  pageMap = JSON.parse(JSON.stringify(addedMap));  
  
  article_locations.forEach(function(article_location, index) {
    var county = countyMap[article_location.county_id];
        
    if (article_location.neighborhood_id) {
      var neighborhood = county.neighborhoods.filter(function(item) {
        return item.id == article_location.neighborhood_id;
      })[0];
      key = '#neighborhood-'+ article_location.neighborhood_id + ' .articles'
      addedArray = addedMap[key]
      if (addedArray.includes(article_location.article_id)) {
        console.log("found " + article_location.article_id + " in " + addedArray)
        addedArray.splice( $.inArray(article_location.article_id, addedArray), 1 );
        addedMap[key] = addedArray
        $(key).append(summary(county, article_location, edit, neighborhood))   
      } else {
        console.log("could not find " + article_location.article_id + " in " + addedArray)
      }
    }
    else if (article_location.county_id) {
      key = '#county-'+ article_location.county_id + ' .other .articles'
      addedArray = addedMap[key]
      if (addedArray.includes(article_location.article_id)) {
        console.log("found " + article_location.article_id + " in " + addedArray)
        addedArray.splice( $.inArray(article_location.article_id, addedArray), 1 );
        addedMap[key] = addedArray
        $(key).append(summary(county, article_location, edit))     
      } else {
        console.log("could not find " + article_location.article_id + " in " + addedArray)
      }
    } else {
      console.log(article_location)
    }
  });
	
  counties.forEach(function(county) {
      var articlesDiv = $('#county-'+ county.id + ' .other .articles')
      if (articlesDiv.is(':empty')) {
        articlesDiv.html('<b class="no-stories">No Stories Available</b>')
      }
  	  county.neighborhoods.forEach(function(neighborhood) {
        var articlesDiv = $('#neighborhood-'+ neighborhood.id)
        if ($('#neighborhood-'+ neighborhood.id + ' .articles').is(':empty')) {
          articlesDiv.hide()
        }
      });
  });
	
	
} 