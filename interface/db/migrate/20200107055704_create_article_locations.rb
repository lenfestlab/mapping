class CreateArticleLocations < ActiveRecord::Migration[5.2]
  def change
    create_table :article_locations do |t|
      t.references :article, foreign_key: true
      t.references :location, foreign_key: true

      t.timestamps
    end
  end
end
