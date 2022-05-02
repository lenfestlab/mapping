class AddResultsToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :results, :jsonb, :null => false, :default => {}
  end
end
