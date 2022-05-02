class AddNeigborhoodGeoidToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :neigborhood_geoid, :string
    add_column :locations, :census_geoid, :string
    add_column :locations, :county_geoid, :string
  end
end
