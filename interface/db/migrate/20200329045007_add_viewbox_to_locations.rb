class AddViewboxToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :viewbox, :string
  end
end
