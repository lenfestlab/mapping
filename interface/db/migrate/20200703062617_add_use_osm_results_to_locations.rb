class AddUseOsmResultsToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :use_osm, :boolean, :default => true
  end
end
