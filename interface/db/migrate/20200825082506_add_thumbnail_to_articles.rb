class AddThumbnailToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :thumbnail, :string
  end
end
