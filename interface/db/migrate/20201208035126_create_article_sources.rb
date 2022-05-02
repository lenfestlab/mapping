class CreateArticleSources < ActiveRecord::Migration[5.2]
  def change
    create_table :article_sources do |t|
      t.references :article, foreign_key: true
      t.references :person, foreign_key: true

      t.timestamps
    end
  end
end
