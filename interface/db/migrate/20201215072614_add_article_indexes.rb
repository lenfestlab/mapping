class AddArticleIndexes < ActiveRecord::Migration[5.2]
  def change
    add_index :article_topics, [:article_id, :topic_id], unique: true
    add_index :article_sources, [:article_id, :person_id], unique: true
  end
end
