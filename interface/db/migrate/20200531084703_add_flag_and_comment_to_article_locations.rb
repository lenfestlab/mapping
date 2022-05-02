class AddFlagAndCommentToArticleLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :article_locations, :flagged, :boolean, :default => false
    add_column :article_locations, :comment, :text
  end
end
