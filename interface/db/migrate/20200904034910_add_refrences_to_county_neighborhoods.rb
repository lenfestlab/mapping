class AddRefrencesToCountyNeighborhoods < ActiveRecord::Migration[5.2]
  def change
    add_column :county_neighborhoods, :county_id, :integer, default: 0, null: false
    add_column :county_neighborhoods, :neighborhood_id, :integer, default: 0, null: false
    add_index :county_neighborhoods, :county_id
    add_index :county_neighborhoods, :neighborhood_id
  end
end
