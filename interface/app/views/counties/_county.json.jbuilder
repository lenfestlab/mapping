json.extract! county, :id, :name, :state_code, :geoid
# json.url county_url(county, format: :json)
json.neighborhoods county.neighborhoods do |neighborhood|
  json.partial! 'neighborhoods/neighborhood', neighborhood: neighborhood
end