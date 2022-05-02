class CreateArticleAuthors < ActiveRecord::Migration[5.2]
  def change
    create_table :article_authors do |t|
      t.references :article, foreign_key: true
      t.references :author, foreign_key: true

      t.timestamps
    end
  end
end
