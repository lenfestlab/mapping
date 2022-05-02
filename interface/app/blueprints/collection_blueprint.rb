class CollectionBlueprint < Blueprinter::Base

  field :zip_codes do |data, options|
    collection = data[:collection]
    articles = data[:articles]
    count = articles.joins(:locations).group(["analytics_channel", "zipcode_geoid"]).count
    hash = {}
    count.each do |key, value|
      analytics_channel = key.first
      geoid = key.second
      data = hash.fetch(geoid,{})
      data[analytics_channel] = data.fetch(analytics_channel,0) + value    
      data["total"] = data.fetch("total", 0) + value
      hash[geoid] = data  
    end
    hash
  end

  coverage_area_counties = [2251,2259,2245,2282,2287,1775,1771,1770]

  field :counties do |data, options|
    collection = data[:collection]
    articles = data[:articles]
    count = articles.joins(:locations).where("county_id IN (?)", coverage_area_counties).group(["analytics_channel", "county_geoid"]).count
    hash = {}
    count.each do |key, value|
      analytics_channel = key.first
      geoid = key.second
      data = hash.fetch(geoid,{})
      data[analytics_channel] = data.fetch(analytics_channel,0) + value    
      data["total"] = data.fetch("total", 0) + value
      hash[geoid] = data  
    end
    hash
  end
  
  field :coverage_area do |data, options|
    collection = data[:collection]
    articles = data[:articles]
    count = articles.joins(:locations).where("county_id IN (?)", coverage_area_counties).group(["analytics_channel", "county_geoid"]).count
    hash = {}
    count.each do |key, value|
      analytics_channel = key.first
      hash[analytics_channel] = hash.fetch(analytics_channel,0) + value    
      hash["total"] = hash.fetch("total", 0) + value
    end
    hash
  end
  
  

end