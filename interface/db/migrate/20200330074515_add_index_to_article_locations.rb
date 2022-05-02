class AddIndexToArticleLocations < ActiveRecord::Migration[5.2]
  def change
    add_index :article_locations, [:article_id, :location_id], unique: true
  end
end
