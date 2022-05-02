class AddTypeToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :geometry_type, :string
  end
end
