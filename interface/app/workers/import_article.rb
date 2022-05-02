class ImportArticle
  include Sidekiq::Worker

  def perform(collection_id, article_hash)
    author_names = article_hash['author_names']
    article_hash.delete('author_names')
    if author_names.present?
      author_names = author_names.split("|")
    else
      author_names = []
    end
    authors = []
    author_names.each do | author_name |
      authors << Author.find_or_create_by!(name: author_name)
    end
    article = Article.find_or_create_by!(identifier: article_hash['identifier'])
    article.collection_id = collection_id
    article.viewbox = '-74.194188332210331,40.981164736109228,-76.467791908698715,38.676157795304704'
    values = Article.column_names
    article.info = article_hash.except(*values).compact
    article.assign_attributes(article_hash.slice(*values))      
    article.save
    article.authors = authors
  end
end