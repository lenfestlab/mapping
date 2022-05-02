function DataStore(results) {
  this.authors = new Set();
  this.topics = new Set();
  this.reporters = new Set();
  this.genders = new Set();
  this.races = new Set();
  this.census_tracts = new Set();
  this.counties = new Set();
  this.neighborhoods = new Set();

  this.loadedMetaData = results[0] // location-data/inquirer-metadata.csv
  this.localPointsData = results[1] // location-data/inquirer-points.geojson

  var count = {
    "GEOID-NH": {},
    "GEOID-CO": {},
    "GEOID-CT": {},
  }
  for (polyItem of this.localPointsData.features) {
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

  this.polyDataCount = count


  this.getPointFeatures = function(geoId, layerKey, filter) {
    var pointFeatures = this.localPointsData.features

    let filteredFeatures = [];
    for (let i = 0; i < pointFeatures.length; i++) {
      pointFeature = pointFeatures[i]
      if (pointFeature.properties[layerKey] == geoId) {
        filteredFeatures.push(pointFeature);
      }
    }

    return filteredFeatures
  }

  this.getPointsCount = function(geoId, layerKey, filter, articleIds) {
    var pointFeatures = this.getPointFeatures(geoId, layerKey, filter)

    pointsCount = 0
    for (i in pointFeatures) {
      pointFeature = pointFeatures[i]

      if ($.isArray(pointFeature.properties.articles)) {
        articles = Array.from(new Set(pointFeature.properties.articles))
      } else {
        try {
          var articles = JSON.parse(pointFeature.properties.articles);
        } catch (e) {
          var articles = [pointFeature.properties.articles];
        }
      }
      articles = Array.from(new Set(articles))
      filtered = articleIds.filter(x => articles.includes(x));
      pointsCount = pointsCount + filtered.length
    }
    return pointsCount;
  }

  this.filteredMetadata = function(filter) {
    filtered = []

    let authorActive = filter.authorFilter.active()
    let reporterActive = filter.reporterFilter.active()
    let topicActive = filter.topicFilter.active()
    let raceActive = filter.raceFilter.active()
    let genderActive = filter.genderFilter.active()
    let toActive = filter.toFilter.active()
    let fromActive = filter.fromFilter.active()

    for (var i = 0; i < this.articles.length; i++) {
      article = this.articles[i];
      let authors = article.authors
      let reporter = article.reporter
      let people = article.people
      let races = new Set()
      let genders = new Set()
      for (var j = 0; j < people.length; j++) {
        let person = people[j]
        if (person.gender) {
          genders.add(person.gender)
        }
        if (person.race) {
          races.add(person.race)
        }
      }

      push = true

      if (authorActive) {
        if (authors.indexOf(filter.authorFilter.value) == -1) {
          push = false
        }
      }

      if (push) {
        if (reporterActive) {
          if (reporter != filter.reporterFilter.value) {
            push = false
          }
        }
      }

      if (push) {
        if (topicActive) {
          if (article.topics.indexOf(filter.topicFilter.value) == -1) {
            push = false
          }
        }
      }

      if (push) {
        let f = filter.censusFilter
        if (f.active()) {
          if (article.census_tracts.indexOf(f.value) == -1) {
            push = false
          }
        }
      }

      if (push) {
        let f = filter.countyFilter
        if (f.active()) {
          if (article.counties.indexOf(f.value) == -1) {
            push = false
          }
        }
      }

      if (push) {
        let f = filter.neighborhoodFilter
        if (f.active()) {
          if (article.neighborhoods.indexOf(f.value) == -1) {
            push = false
          }
        }
      }

      if (push) {
        if (raceActive) {
          if (!races.has(filter.raceFilter.value)) {
            push = false
          }
        }
      }

      if (push) {
        if (genderActive) {
          if (!genders.has(filter.genderFilter.value)) {
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
        filtered.push(article)
      }
    }
    return filtered
  }

  this.articles = this.loadedMetaData.map(function(metaData) {
    article = new Article(metaData);
    return article;
  });

  this.articleIDMapping = this.articles.reduce(function(map, article) {
    map[article.id] = article;
    return map;
  }, {});

  for (var i = 0; i < this.articles.length; i++) {
    let article = this.articles[i]
    article.authors.forEach(this.authors.add, this.authors)
    article.topics.forEach(this.topics.add, this.topics)
    if (article.reporter) {
      this.reporters.add(article.reporter)
    }
    if (article.counties) {
      article.counties.forEach(this.counties.add, this.counties)
    }
    if (article.neighborhoods) {
      article.neighborhoods.forEach(this.neighborhoods.add, this.neighborhoods)
    }
    if (article.census_tracts) {
      article.census_tracts.forEach(this.census_tracts.add, this.census_tracts)
    }

    for (var j = 0; j < article.people.length; j++) {
      let person = article.people[j]
      if (person.gender) {
        this.genders.add(person.gender)
      }
      if (person.race) {
        this.races.add(person.race)
      }
    }
  }

}
