json.extract! article_location, :id, :snippet, :article_id, :location_id

article = article_location.article

json.source_url article.source_url
json.title article.title
json.thumbnail article.thumbnail
json.published_at article.published_at
json.identifier article.identifier

location = article_location.location

json.location_name location.name
json.county_id location.county_id
json.neighborhood_id location.neighborhood_id
