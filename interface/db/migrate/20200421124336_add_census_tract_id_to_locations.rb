class AddCensusTractIdToLocations < ActiveRecord::Migration[5.2]
  def change
    add_reference :locations, :census_tract, index: true
  end
end
