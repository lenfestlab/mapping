const articlesPerPage = 5000;
const pointsPerPage = 1000;

const getArticles = async function(collectionId, pageNo = 1) {
    let metaDataURL = "https://lenfest-mapping.herokuapp.com/collections/" + collectionId + "/simple_articles.json"
    
    let actualUrl = metaDataURL + `?page=${pageNo}&per_page=${articlesPerPage}`;
    
    
    console.log("Retreiving articles from API for page : " + actualUrl);
    
    var apiResults=await fetch(actualUrl)
    .then(resp=>{
        return resp.json();
    });
  
    $('.header').text("Loading Articles: " + pageNo*articlesPerPage)

    return apiResults['articles'];
}

const getAllArticles = async function(collectionId, pageNo = 1) {
  const results = await getArticles(collectionId, pageNo);
  if (results.length>0) {
    return results.concat(await getAllArticles(collectionId, pageNo+1));
  } else {
    return results;
  }
};

const getPoints = async function(pointsURL, pageNo = 1) {
    let actualUrl = pointsURL + `page=${pageNo}&per_page=${pointsPerPage}`;
    
    console.log("Retreiving points from API for page : " + actualUrl);  
    
    var apiResults=await $.getJSON(actualUrl).then(function(data){
        return data;
    });
  
    $('.header').text("Loading Points: " + pageNo*pointsPerPage)

    return apiResults;
}

const getAllPoints = async function(pointsURL, pageNo = 1) {
  const results = await getPoints(pointsURL, pageNo);
  if (results.length>0) {
    return results.concat(await getAllPoints(pointsURL, pageNo+1));
  } else {
    return results
  }
};

const getAllFeatures = async function(pointsURL) {
  return {
      "type": "FeatureCollection",
      "name": "clip-points-co-ct-nh",
      "crs": {
          "type": "name",
          "properties": {
              "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
          }
      },
      "features": await getAllPoints(pointsURL)
    }
}

////