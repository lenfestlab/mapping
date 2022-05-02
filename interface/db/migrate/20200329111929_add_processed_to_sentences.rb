class AddProcessedToSentences < ActiveRecord::Migration[5.2]
  def change
    add_column :sentences, :processed, :boolean, :default => false
  end
end
