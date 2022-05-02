json.extract! state, :id, :name, :country, :iso3166_1_alpha_3

json.counties state.counties do |county|
    json.partial! 'states/county', county: county
end

json.url state_url(state, format: :json)
