class AddResponseToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :response, :jsonb, :null => false, :default => {}
  end
end
