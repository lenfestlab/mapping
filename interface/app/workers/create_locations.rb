class CreateLocations
  include Sidekiq::Worker
  sidekiq_options queue: :urgent


  # The latitude/longitude around which to retrieve place information. 
  # This must be specified as latitude,longitude. 
  # If you specify a location parameter, you must also specify a radius parameter.
  
  def perform(bert_tag_id)
    puts "Fetching BertTag: #{bert_tag_id}"
    begin
      bert_tag_model = BertTag.find(bert_tag_id)
      article = bert_tag_model.sentence.article
    rescue ActiveRecord::RecordNotFound 
      puts "BertTag not found: #{bert_tag_id}" 
     return
    end

    article_id = article.id
    viewbox = article.viewbox
    bias = article.location_bias
    viewbox = '-74.194188332210331,40.981164736109228,-76.467791908698715,38.676157795304704'
    
    bert_tag = bert_tag_model.content

    if ["U . S .", 'U . S', 'U', 'S', 'U.S.', 'US', "USA", "UK", "Britain", "United States", "America", "County", "France"].include?(bert_tag)
      return
    end
        
    if CS.get.values.any?{ |s| s.casecmp(bert_tag)==0 }
      return
    end
    
    CS.get.keys.each do | key |
      states = CS.states(key).values
      if states.any?{ |s| s.casecmp(bert_tag)==0 }
        return
      end
    end
    
    if viewbox.blank? || bias.blank?
      collection = article.collection
      if collection.present?
        if viewbox.blank?
          viewbox = collection.viewbox
        end
        if bias.blank?
          bias = collection.bias
        end
      end
    end
    
    puts "Finding location: #{bert_tag}"
    location = Location.find_by(name: bert_tag, viewbox: viewbox, bias: bias)
    if location != nil
      puts "Found location: #{bert_tag}"
    else
      location = Location.create!(name: bert_tag, viewbox: viewbox, bias: bias) 
      puts "Created location: #{bert_tag}"
    end
    
    if location == nil
      return
    end
    
    bert_tag_model.location = location
    bert_tag_model.save!
  end
end