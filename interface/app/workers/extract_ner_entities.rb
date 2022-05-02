class ExtractNerEntities
  include Sidekiq::Worker
  sidekiq_options queue: :bert

  def perform(id)
    sentence = Sentence.find_by(id: id)
    if sentence == nil
      return
    end
    if sentence.ner_response.present?
      return
    end
    response = Typhoeus.post( "http://165.227.213.110:41686/ner", body: { 'content': CGI.escape(sentence.content) })    
    if response.success?    
      response_body = JSON.parse(response.body)
      results = response_body['results']
      sentence.ner_response = results
      sentence.save
      
      tags = results['bert_tags']
      if tags.count != sentence.bert_tags.count
        tags.each do | bt | 
          if ["ORG", "LOC"].include?(bt['tag'])
            b = BertTag.new
            b.content = bt['text']
            b.start_position = bt['start_position']
            b.end_position = bt['end_position']
            b.tag_type = bt['tag']
            b.model_version = "v2"
            b.sentence = sentence
            b.save
          end
        end
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