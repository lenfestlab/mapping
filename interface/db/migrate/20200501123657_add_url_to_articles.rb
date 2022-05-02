class AddUrlToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :source_url, :string
  end
end
