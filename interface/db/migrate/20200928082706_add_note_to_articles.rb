class AddNoteToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :comment, :text
  end
end
