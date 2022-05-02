function placeKeyForCounty(county) {
    let countyName = county.name
    let stateCode = county.state_code
    let placeKey = countyName + " " + stateCode
    placeKey = placeKey.replace(/\s+/g, '-').toLowerCase();      
    return placeKey
}

function placeNameForCounty(county, includeState=true) {
    let countyName = county.name
    let stateCode = county.state_code
    let placeName = ""
    if (countyName != null) {
      placeName = placeName + countyName + ' County'
      if (stateCode != null & includeState) {
        placeName = placeName + ", " + stateCode
      }
    }
    return placeName
}

function loadMaps() {
  
  Promise.all([
        d3.json('/pa/statistics.json'),
  ]).then(function (results) {  
    var stats = results[0]
    
    stats.forEach(function(county_stats) {
      loadCountyStatistics(county_stats)
    });
    
  });
  
  Promise.all([
        d3.json('/nj/statistics.json'),
  ]).then(function (results) {  
    var stats = results[0]
    
    stats.forEach(function(county_stats) {
      loadCountyStatistics(county_stats)
    });
    
  });
  
}

function loadCountyStatistics(county_stats) {
    var trend = county_stats['trend']
    var index = county_stats['index']
    var values = county_stats['values']
    var key = county_stats['key']
    var avg = eval(values.slice(-14).join("+"))/14
    
    trendDiv = $('.' + key + ' .stat-trend')
    trendDiv.text(trend);
    if (trend == "Unclear") {
      trendDiv.css('background-color', '#d3d3d3');
    }
    if (trend == "Rising") {
      trendDiv.css('background-color', '#F1BBA4');
    }
    if (trend == "Falling") {
      trendDiv.css('background-color', '#DCEFD1');
    }

    var ctx = $('.' + key + ' #chart');
    
    if (ctx.length == 1) {
     
      var myChart = new Chart(ctx, {
        "type": "line",
        "data": {
          "labels": index,
          "datasets": [{
            "label": "7 Day Moving Average",
            "data": values,
            "fill": false,
            "borderColor": "rgb(179, 0, 0)",
            "borderWidth": 1,
          }]
        },
        "options": {
          maintainAspectRatio: false,
            layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: -7
                        }
                    },
            responsive: true,
            showTooltips: false,
            events: [],
            legend: {
                display: false
            },
            elements: {
                point:{
                    radius: 0
                }
            },
            scales:{
              xAxes: [{
                type: 'time',
                time: {
                  parser: 'YYYY-MM-DD',
                  unit: 'day',
                  displayFormats: {
                    day: 'MMM D, YYYY'
                  }
                },
                offset: true,
                gridLines: {
                  color: 'rgba(0, 0, 0, 0.0)',
                  display: false
                },  
                scaleLabel: {
                  fontSize: 24,
                },
                ticks: {
                  display: true,
                  callback: function(v, idx, vs) {
                    if (idx == vs.length -1) {
                      return v;
                    } else if (idx == 0) {
                      return v;
                    } else {
                      return '';
                    }
                  },
                  autoSkip: false,
                  maxRotation: 0,
                  minRotation: 0,
                  maxTicksLimit: 2,
                  minTicksLimit: 2,
                  // labelOffset: 10,
                  // stepSize:
                }
                }],
                yAxes: [{
                    display: false //this will remove all the x-axis grid lines
                }]
            }
        }
      });
      
    }

}