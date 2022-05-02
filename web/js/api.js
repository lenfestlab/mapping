const limitPerPage=100;

////      
const getArticles = async function(pageNo = 1) {
  let actualUrl = metaDataURL + `?page=${pageNo}&per_page=${limitPerPage}`;
  console.log("Retreiving articles from API for page : " + actualUrl);
  var apiResults=await fetch(actualUrl)
  .then(resp=>{
    return resp.json();
  });
  return apiResults['articles'];
}

const getAllArticles = async function(pageNo = 1) {
  const results = await getArticles(pageNo);
  if (results.length>0) {
    return results.concat(await getAllArticles(pageNo+1));
  } else {
    return results;
  }
};
////

////      
const getPoints = async function(pageNo = 1) {
  let actualUrl = pointsURL + `?bind=true&page=${pageNo}&per_page=${limitPerPage}`;
  console.log("Retreiving points from API for page : " + actualUrl);  
  var apiResults=await $.getJSON(actualUrl).then(function(data){
    return data;
  });
    let metaCount = apiResults['meta']['count']
    $('.header').text("Loading Points: " + Math.min(pageNo*limitPerPage, metaCount) + "/" + metaCount)
  
    return apiResults['locations'];
}

const getAllPoints = async function(pageNo = 1) {
  const results = await getPoints(pageNo);
  if (results.length>0) {
    return results.concat(await getAllPoints(pageNo+1));
  } else {
    return results
  }
};

const getAllFeatures = async function() {
  return {
      "type": "FeatureCollection",
      "name": "clip-points-co-ct-nh",
      "crs": {
          "type": "name",
          "properties": {
              "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
          }
      },
      "features": await getAllPoints()
    }
}

////