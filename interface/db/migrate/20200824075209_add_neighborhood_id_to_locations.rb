class AddNeighborhoodIdToLocations < ActiveRecord::Migration[5.2]
  def change
    add_reference :locations, :neighborhood, foreign_key: true
  end
end
