class ExtractBertEntities
  include Sidekiq::Worker
  sidekiq_options queue: :bert

  def perform(id)
    model_version = "v2"
    sentence = Sentence.find_by(id: id)
    if sentence == nil
      return
    end
    if sentence.response.present?
      return
    end
    bert_tags_count = sentence.bert_tags.where("model_version = ?", model_version).count
    if bert_tags_count > 0
      return
    end
    response = Typhoeus.post("http://165.227.213.110:41686/", body: { 'content': CGI.escape(sentence.content) })    
    if response.success?    
      response_body = JSON.parse(response.body)
      results = response_body['results']
      sentence.ner_response = results
      sentence.save
      
      tags = results['bert_tags']
      tags.each do | bt | 
        b = BertTag.new
        b.content = bt
        b.model_version = model_version
        b.sentence = sentence
        b.save
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