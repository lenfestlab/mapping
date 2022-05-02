class AddIdentifierToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :identifier, :string
  end
end
