class AddZipcodeGeoidToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :zipcode_geoid, :string
  end
end
