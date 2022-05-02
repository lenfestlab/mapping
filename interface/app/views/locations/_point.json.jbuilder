json.set! :properties do
  json.set! :identifier, location.id
  json.set! "GEOID-NH", location.neigborhood_geoid
  json.set! "GEOID-CT", location.census_geoid
  json.set! "GEOID-CO", location.county_geoid
  
  json.articles location.article_identifiers
end

json.type "Feature"
 
json.geometry location.results['geojson']
 
