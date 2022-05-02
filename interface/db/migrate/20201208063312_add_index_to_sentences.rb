class AddIndexToSentences < ActiveRecord::Migration[5.2]
  def change
    add_index :sentences, [:article_id, :content], unique: true
  end
end
