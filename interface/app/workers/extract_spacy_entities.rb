class ExtractSpacyEntities
  include Sidekiq::Worker
  sidekiq_options queue: :spacy

  def perform(id)
    sentence = Sentence.find_by(id: id)
    if sentence == nil
      return
    end
    response = Typhoeus.post( "http://165.227.213.110:41686/entities", body: { 'content': CGI.escape(sentence.content) })    
    if response.success?    
      response_body = JSON.parse(response.body)
      sentence.spacy_response = response_body['results']
      sentence.save
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