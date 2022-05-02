json.articles do
  json.cache_collection! @articles, expires_in: 1.hour do |article|
    json.partial! 'articles/simple_article', article: article
  end
end 
