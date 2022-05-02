class RemoveNeighborhoods < ActiveRecord::Migration[5.2]
  def change
    remove_column :locations, :neighborhood_id
    drop_table :neighborhoods
  end
end
