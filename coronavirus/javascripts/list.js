function topFunction() {
  track('back-to-top', 'navigation');
  
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

$(document).ready(function() {
  let searchParams = new URLSearchParams(window.location.search)

  if (!(searchParams.has('after') && searchParams.has('before'))) {
    document.body.innerHTML = '<div class="main container"><center>An Error Occured. Missing required parameters.<center></div>' ;
    return
  }

  let after = searchParams.get('after')
  let before = searchParams.get('before')
  let edit = searchParams.has('edit')
  var collection_id = searchParams.get('collection_id')
  collection_id = collection_id ? collection_id : 5

  var county_ids = "2242%2C+2275%2C+2282%2C+1768%2C+1770%2C+1771%2C+1772%2C+1773%2C+1775%2C+1778%2C+1784%2C+2245%2C+2251%2C+2259%2C+2279%2C+2284%2C+2287"
  var base_url = "https://lenfest-mapping.herokuapp.com"
  var articles_url = base_url + "/collections/" + collection_id + "/articles.json?flagged=false&after=" + after + "&before=" + before + "&county_ids=" + county_ids
  var article_locations_url = base_url + "/collections/" + collection_id + "/article_locations.json?flagged=false&after=" + after + "&before=" + before + "&county_ids=" + county_ids
  var counties_url = base_url + "/collections/" + collection_id + "/counties.json?county_ids=" + county_ids

  Promise.all([
        d3.json(counties_url),
        d3.json(article_locations_url),
  ]).then(function (results) {
    		var counties = results[0]
     	 	var article_locations = results[1]

    		loadPage(counties, article_locations, edit)
  })

});