class AddCollectionIdToArticles < ActiveRecord::Migration[5.2]
  def change
    add_reference :articles, :collection, index: true
  end
end
