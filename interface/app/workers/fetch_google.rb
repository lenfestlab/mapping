class FetchGoogle
  include Sidekiq::Worker
  include Sidekiq::Throttled::Worker

  sidekiq_options queue: :google
  
  def perform(id)
    column_names = Location.column_names - ["wkb_geometry"]
    location = Location.select(column_names).find(id)
    if location == nil
      return
    end
    if location.google_results != nil
      return
    end
    params = { query: location.name, key: ENV['GOOGLE_API_KEY'] }
    if location.bias.present?
      params[:location] = location.bias
      params[:radius] = ENV['GOOGLE_API_SEARCH_RADIUS']
    end
    puts params
    request = Typhoeus::Request.new(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      method: :get,
      params: params,
    )
    request.run
    response = request.response
    if response.code == 204
      puts "Empty Response 204"
    elsif response.success?    
      results = JSON.parse(response.body)
      location.google_results = results
      location.save
    elsif response.timed_out?
      # aw hell no
      raise "got a time out"
    elsif response.code == 0
      # Could not get an http response, something's wrong.
      raise response.return_message
    else
      # Received a non-successful http response.
      raise "HTTP request failed: " + response.code.to_s
    end
  end
end