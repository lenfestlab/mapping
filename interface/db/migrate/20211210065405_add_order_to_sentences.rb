class AddOrderToSentences < ActiveRecord::Migration[5.2]
  def change
    add_column :sentences, :position, :integer, :default => 0
  end
end
