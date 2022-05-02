class AddEvaluateToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :evaluate, :boolean, :default => true
  end
end
