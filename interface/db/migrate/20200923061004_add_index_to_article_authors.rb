class AddIndexToArticleAuthors < ActiveRecord::Migration[5.2]
  def change
    add_index :article_authors, [:article_id, :author_id], unique: true
  end
end
