class RemoveResultsFromArticles < ActiveRecord::Migration[5.2]
  def change
    remove_column :articles, :results
  end
end
