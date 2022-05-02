class FetchSentences
  include Sidekiq::Worker

  sidekiq_options queue: :critical

  def perform(id)
    article = Article.find_by(id: id)
    if article == nil
      return
    end
    
    if article.sentences.count > 0
      return
    end
    
    body = { content: article.text }
    request = Typhoeus::Request.new(
      "http://50.116.51.13:41686/sentences",
      method: :post,
      body: body,
    )
    request.run
    response = request.response
    results = JSON.parse(response.body)
    
    results.each do | result |
      sentence = Sentence.new
      sentence.position = result['order']
      sentence.start_char = result['start_char']
      sentence.end_char = result['end_char']
      sentence.content = result['content']
      sentence.identifier = result['id']
      sentence.article = article
      sentence.save
    end
    
    article.save
  end
end