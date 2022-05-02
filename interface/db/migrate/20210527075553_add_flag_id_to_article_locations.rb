class AddFlagIdToArticleLocations < ActiveRecord::Migration[5.2]
  def change
    add_reference :article_locations, :flag, foreign_key: true
  end
end
