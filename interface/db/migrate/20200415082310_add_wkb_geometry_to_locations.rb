class AddWkbGeometryToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :wkb_geometry, :geometry
    add_index :locations, :wkb_geometry, using: 'gist'
  end
end
