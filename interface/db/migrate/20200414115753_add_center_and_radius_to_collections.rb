class AddCenterAndRadiusToCollections < ActiveRecord::Migration[5.2]
  def change
    add_column :collections, :lat, :decimal, {:precision=>10, :scale=>6}
    add_column :collections, :lng, :decimal, {:precision=>10, :scale=>6}
    add_column :collections, :km_radius, :decimal, {:precision=>10, :scale=>6}
    add_column :collections, :center, :st_point, geographic: true
  end
end
