class AddViewboxToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :viewbox, :string
  end
end
