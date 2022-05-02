class ReaddNeighborhoodIdToLocations < ActiveRecord::Migration[5.2]
  def change
    add_reference :locations, :neighborhood
  end
end
