class RemoveSentencesFromArticles < ActiveRecord::Migration[5.2]
  def change
    remove_column :articles, :sentences
  end
end
