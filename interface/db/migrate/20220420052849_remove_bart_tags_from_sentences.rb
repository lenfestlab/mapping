class RemoveBartTagsFromSentences < ActiveRecord::Migration[5.2]
  def change
    remove_column :sentences, :bart_tags
  end
end
