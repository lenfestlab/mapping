hash = {}

@collection.articles.joins(:locations).select('articles.id, articles.analytics_channel, array_agg(locations.zip_code_id) zip_codes_array').group('articles.id, articles.analytics_channel').where("zip_code_id IS NOT NULL").each do | article |
  article.zip_codes_array.each do | zip_code_id |
    
    data = hash.fetch(zip_code_id,{})
    
    topic_count = data.fetch(article.analytics_channel,0)
    topic_count += 1
    data[article.analytics_channel] = topic_count
    
    count = data.fetch("total", 0)
    count += 1
    data["total"] = count
    
    hash[zip_code_id] = data
    
  end
end

json.zip_codes do
  hash.each do |zip_code_id, value|
    json.set! ZipCode.select(:zcta5ce10).find(zip_code_id).zcta5ce10, value
  end
end

