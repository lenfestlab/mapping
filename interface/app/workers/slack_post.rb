class SlackPost
  include Sidekiq::Worker

  def perform(neighborhood_id, since)    
    neighborhood = Neighborhood.find_by(ogc_fid: neighborhood_id)
    if neighborhood == nil
      return
    end
        
    blocks = [
      {
        "type": "header", 
        "text": {
          "type": "plain_text", 
          "text": neighborhood.listname
          }
        }
      ]
      
    articles = neighborhood.articles.where("articles.created_at > ?", since).uniq
    if articles.count > 0
      articles.each do | article |
        section = {
          "type": "section", 
          "text": {
            "type": "mrkdwn", 
            "text": article.slack_post_message
            }
          }
        blocks.push(section)
                  
        locations = article.locations.where("neighborhood_id = ?", neighborhood_id)
        context = {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": "*Locations in #{neighborhood.listname}:* #{locations.uniq.pluck(:name).join(", ")}\n"
            }
          ]
        }
        blocks.push(context)
      end
    else
      block =       {
        "type": "section", 
        "text": {
          "type": "plain_text", 
          "text": "No Articles Found"
          }
        }
      blocks.push(block)
    end
    requestBody =  { 
      "blocks": JSON.pretty_generate(blocks), 
      "channel": "C02PV7C8C4R"
    }
    
    request = Typhoeus::Request.new(
      "https://slack.com/api/chat.postMessage",
      method: :post,
      headers: {
        "Authorization" => "Bearer #{ENV['SLACK_API_TOKEN']}",
      },
      body: requestBody
    )
      
    request.run
    response = request.response
    results = JSON.parse(response.body)
    
  end
end