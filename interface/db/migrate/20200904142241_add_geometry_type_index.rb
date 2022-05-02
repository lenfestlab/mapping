class AddGeometryTypeIndex < ActiveRecord::Migration[5.2]
  def change
    add_index :locations, :geometry_type
  end
end
