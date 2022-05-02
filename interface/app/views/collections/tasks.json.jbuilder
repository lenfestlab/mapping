json.cache_collection! @articles, expires_in: 1.hour do |article|
  json.partial! 'articles/task', article: article
end
