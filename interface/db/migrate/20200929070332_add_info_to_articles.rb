class AddInfoToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :info, :jsonb, :null => false, :default => {}
  end
end
