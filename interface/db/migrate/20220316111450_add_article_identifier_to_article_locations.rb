class AddArticleIdentifierToArticleLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :article_locations, :article_identifier, :string
  end
end
