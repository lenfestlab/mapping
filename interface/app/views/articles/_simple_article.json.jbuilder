json.extract! article, :id, :title, :source_url, :identifier, :published_at, :thumbnail, :info

json.topic_ids article.topic_ids_array
json.author_ids article.author_ids_array

# json.people do
#   json.array! article.people do |person|
#       json.name person.name
#       json.gender person.gender
#       json.race person.race
#   end
# end

