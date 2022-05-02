class ArticleBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :source_url, :identifier, :published_at, :thumbnail, :info
  
  field :topic_ids_array, name: :topic_ids
  field :author_ids_array, name: :author_ids
  
end
