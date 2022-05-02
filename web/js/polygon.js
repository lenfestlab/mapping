function PolygonDataStore(results) {
    this.polyData = results // location-data/inquirer-polys.csv
    
    this.polyDataCountOld = function (articleIds) {
        var count = {
            "GEOID-NH": {},
            "GEOID-CO": {},
            "GEOID-CT": {},
        }
        for (polyItem of this.polyData) {
            articles = Array.from(new Set(polyItem.articles.split(',')))
            filtered = articleIds.filter(x => articles.includes(x));

            var key = "GEOID-NH"    
            id = polyItem[key]
            count[key][id] = (count[key][id] === undefined) ? 1 : count[key][id] + filtered.length;

            key = "GEOID-CO"
            id = polyItem[key]
            count[key][id] = (count[key][id] === undefined) ? 1 : count[key][id] + filtered.length;

            key = "GEOID-CT"
            id = polyItem[key]
            count[key][id] = (count[key][id] === undefined) ? 1 : count[key][id] + filtered.length;
        }

        return count
    }
    
    var count = {
        "GEOID-NH": {},
        "GEOID-CO": {},
        "GEOID-CT": {},
    }
    for (polyItem of this.polyData) {
        articles = Array.from(new Set(polyItem.articles.split(',')))
        filtered = articles;

        var key = "GEOID-NH"    
        id = polyItem[key]
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
        id = polyItem[key]
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
        id = polyItem[key]
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

}