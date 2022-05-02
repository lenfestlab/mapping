class AddCountyIdToLocations < ActiveRecord::Migration[5.2]
  def change
    add_reference :locations, :county, index: true
  end
end
