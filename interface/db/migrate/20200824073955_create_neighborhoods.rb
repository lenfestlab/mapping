class CreateNeighborhoods < ActiveRecord::Migration[5.2]
  def change
    create_table :neighborhoods do |t|
      t.string :name
      t.geometry :wkb_geometry

      t.timestamps
    end
  end
end
