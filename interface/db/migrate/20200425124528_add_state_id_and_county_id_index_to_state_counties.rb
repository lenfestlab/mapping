class AddStateIdAndCountyIdIndexToStateCounties < ActiveRecord::Migration[5.2]
  def change
    add_index :state_counties, [:state_id, :county_id], unique: true
    remove_index :state_counties, :county_id
    add_index :state_counties, :county_id, unique: true
  end
end
