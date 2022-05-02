json.data do
  json.id article.id
  json.identifier article.identifier
  json.text article.text
  json.analytics_channel article.analytics_channel
  json.authors article.author_names
end

json.predictions do
  json.child! do
    json.model_version "NER"
  
    ents = []

    article.sentences.order("position").each do | sentence |
      if !sentence.response.empty?
        sentence.spacy_response['ents'].each do | ent |
          if ent['label_'] == "ORG"
            ent['start_char'] = sentence.start_char+ent['start_char']
            ent['end_char'] = sentence.start_char+ent['end_char']
            ents << ent
          end
        end
      end
    end
    
    json.result do
      json.array!(ents) do |ent|
        # json.position sentence.position
        # json.response sentence.response
        # json.sentence_start_char sentence.start_char
        # json.sentence_content sentence.content
        # json.id "one"
        json.from_name "label"
        json.to_name "text"
        json.type "labels"
        json.value do
            # json.start_char sentence.start_char
            json.start ent['start_char']
            json.end ent['end_char']
            json.score 1
            json.text ent['text']
            json.test article.text[ent['start_char']..ent['end_char']-1]
            json.labels [ent['label_']]
        end
      end
    end
    
  end
end
