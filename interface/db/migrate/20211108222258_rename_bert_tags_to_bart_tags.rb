class RenameBertTagsToBartTags < ActiveRecord::Migration[5.2]
  def change
    rename_column :sentences, :bert_tags, :bart_tags
  end
end
