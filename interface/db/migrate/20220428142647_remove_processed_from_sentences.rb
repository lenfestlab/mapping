class RemoveProcessedFromSentences < ActiveRecord::Migration[5.2]
  def change
    remove_column :sentences, :processed
  end
end
