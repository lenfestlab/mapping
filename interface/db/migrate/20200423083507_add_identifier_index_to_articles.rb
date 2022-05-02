class AddIdentifierIndexToArticles < ActiveRecord::Migration[5.2]
  def change
    add_index :articles, :identifier, unique: true
  end
end
