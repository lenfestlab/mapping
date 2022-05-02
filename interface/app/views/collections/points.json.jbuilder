json.locations do
  json.cache_collection! @locations, expires_in: 1.hour do |location|
    json.partial! 'locations/point', location: location
  end
end 