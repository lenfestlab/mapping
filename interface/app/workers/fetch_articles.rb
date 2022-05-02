class FetchArticles
  include Sidekiq::Worker
  sidekiq_options queue: :urgent

  def perform(collection_id, body, evaluate, from, size)
    params = { 
      from: from.to_s,
      size: size,
      sort: "created_date:desc",
      website: "philly-media-network",
      body: body,
    }
    
    count = 0
    
    # subtypes: regular, live = liveblog, newsletter, reviews, columnist, spotlightpa, 
    # composer has options (get access or demo)
    # documentation
    # bearer token person and project - mike cost or twan
    # is big query sanatized?
    
    headers = {
      'Accept': "application/x-www-form-urlencoded",
      'Content-type': "application/json",
      "Authorization": "Bearer #{ENV['ARC_API_TOKEN']}"
    }
    
    request = Typhoeus::Request.new(
      "https://api.pmn.arcpublishing.com/content/v4/search/published/",
      method: :get,
      params: params,
      headers: headers
    )
    
    request.run
    response = request.response
    if response.code == 204
      puts "Empty Response 204"
    elsif response.success?    
      data = JSON.parse(response.body)

      content_elements = data['content_elements']

      content_elements.each do |content_element|
        SaveArticles.perform_async(content_element, collection_id, evaluate)
      end
      
      if content_elements.length > 0
        next_from = data['next']
        FetchArticles.perform_async(collection_id, body, true, next_from, size)        
      end
      
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