class AddArticleIdentifiersToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :article_identifiers, :jsonb, default: []
  end
end
