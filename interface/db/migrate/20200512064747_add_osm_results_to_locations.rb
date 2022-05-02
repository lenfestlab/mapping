class AddOsmResultsToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :osm_results, :jsonb
    add_column :locations, :google_results, :jsonb
  end
end
