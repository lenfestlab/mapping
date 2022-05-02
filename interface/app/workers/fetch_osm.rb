class FetchOsm
  include Sidekiq::Worker
  sidekiq_options queue: :osm

  def perform(id)
    column_names = Location.column_names - ["wkb_geometry"]
    location = Location.select(column_names).find(id)
    if location == nil
      return
    end
    if location.osm_results != nil
      return
    end
    viewbox = location.viewbox
    params = { q: location.name, polygon_geojson: "1", format: "json" }
    if viewbox.present?
      params[:viewbox] = viewbox
    end
    puts params
    request = Typhoeus::Request.new(
      "https://nominatim.openstreetmap.org/search.php",
      method: :get,
      params: params,
    )
    request.run
    response = request.response
    if response.code == 204
      puts "Empty Response 204"
    elsif response.success?    
      results = JSON.parse(response.body)
      location.osm_results = results
      if results.length > 0
        first_result = results[0]
        location.geojson = first_result
      end
      puts "fetch_osm location_save"
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