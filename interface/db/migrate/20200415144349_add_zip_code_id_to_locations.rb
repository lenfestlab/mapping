class AddZipCodeIdToLocations < ActiveRecord::Migration[5.2]
  def change
    add_reference :locations, :zip_code, index: true
  end
end
