function DataStore(metaData, pointsData) {    
    this.loadedMetaData = metaData // location-data/inquirer-metadata.csv
    this.localPointsData = pointsData // location-data/inquirer-points.geojson

    this.polyDataCount = function (filter) {
      var count = {
          "GEOID-NH": {},
          "GEOID-CO": {},
          "GEOID-CT": {},
      }
            
      for (polyItem of this.filteredPointsData(filter)) {
          articles = Array.from(new Set(polyItem.properties.articles))
          filtered = articles;

          var key = "GEOID-NH"    
          id = polyItem.properties[key]
          var arr = count[key][id];
          if (arr) {
            arr = arr.concat(filtered);
          } else {
            arr = filtered;
          }
          if (arr.length > 0) {
            count[key][id] = Array.from(new Set(arr));              
          }

          key = "GEOID-CO"
          id = polyItem.properties[key]
          var arr = count[key][id];
          if (arr) {
            arr = arr.concat(filtered);
          } else {
            arr = filtered;
          }
          if (arr.length > 0) {
            count[key][id] = Array.from(new Set(arr));              
          }
        
          key = "GEOID-CT"
          id = polyItem.properties[key]
          var arr = count[key][id];
          if (arr) {
            arr = arr.concat(filtered);
          } else {
            arr = filtered;
          }
          if (arr.length > 0) {
            count[key][id] = Array.from(new Set(arr));              
          }
      }

      return count
    }
    
    this.filteredPointsData = function (filter) {
      filtered = []

      for (var i = 0; i < this.localPointsData.features.length; i++) {
          feature = this.localPointsData.features[i];
          push = true
          
          if (push) {
              let f =  filter.censusFilter
              if (f.active()) {
                  if (f.value != feature.properties['GEOID-CT']) {
                      push = false
                  }
              }
          }
          
          if (push) {
              let f =  filter.countyFilter
              if (f.active()) {
                if (f.value != feature.properties['GEOID-CO']) {
                      push = false
                  }
              }
          }
          
          if (push) {
              let f =  filter.neighborhoodFilter
              if (f.active()) {
                if (f.value != feature.properties['GEOID-NH']) {
                      push = false
                  }
              }
          }

          if (push) {
              filtered.push(feature)
          }
        }
        return filtered
    }

    this.filteredMetadata = function (filter) {
      filtered = []
      
      let toActive = filter.toFilter.active()
      let fromActive = filter.fromFilter.active()

      for (var i = 0; i < this.articles.length; i++) {
          article = this.articles[i];
          push = true

          if (filter.authorFilter.active()) {
              if (article.author_ids.indexOf(parseInt(filter.authorFilter.value)) == -1) {
                  push = false
              }
          }
          
          if (push) {
              if (filter.topicFilter.active()) {
                  if (article.topic_ids.indexOf(parseInt(filter.topicFilter.value)) == -1) {
                      push = false
                  }
              }
          }

          if (push) {
            if (toActive) {
              pubDate = new Date(article.publishedAt)
              if (filter.toFilter.value < pubDate) {
                  push = false
              }
            }
          }
          
          if (push) {
            if (fromActive) {
              pubDate = new Date(article.publishedAt)
              if (filter.fromFilter.value > pubDate) {
                  push = false
              }
            }
          }

          if (push) {
              filtered.push(article['id'])
          }
        }
        return filtered
    }

    this.articles = this.loadedMetaData.map(function (metaData) {
        article = new Article(metaData);
        return article;
    });
      
}