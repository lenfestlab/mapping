class AddNameIndexes < ActiveRecord::Migration[5.2]
  def change
    add_index :topics, :name, unique: true
  end
end
