class RemoveArticleIdentifierFromArticleLocations < ActiveRecord::Migration[5.2]
  def change
    remove_column :article_locations, :article_identifier
  end
end
