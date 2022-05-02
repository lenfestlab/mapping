class AddLatitudeAndLongitudeToLocations < ActiveRecord::Migration[5.2]
  def change
    enable_extension "postgis"
    add_column :locations, :latlng, :st_point, geographic: true
  end
end
