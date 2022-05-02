class MakeAuthorNameUnique < ActiveRecord::Migration[5.2]
  def change
    add_index :authors, :name, unique: true
  end
end
