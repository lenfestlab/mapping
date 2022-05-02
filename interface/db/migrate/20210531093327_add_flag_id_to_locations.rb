class AddFlagIdToLocations < ActiveRecord::Migration[5.2]
  def change
    add_reference :locations, :flag, foreign_key: true
  end
end
