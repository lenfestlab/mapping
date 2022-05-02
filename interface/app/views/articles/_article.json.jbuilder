json.extract! article, :id, :title, :source_url, :identifier, :published_at, :thumbnail, :comment, :topic_names, :info

article_locations = article.article_locations

json.article_locations do
  json.array! article_locations, partial: "article_locations/article_location", as: :article_location
end