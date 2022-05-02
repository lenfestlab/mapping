class AddFlagAndCommentToLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :locations, :flagged, :boolean, :default => false
    add_column :locations, :comment, :text
  end
end
