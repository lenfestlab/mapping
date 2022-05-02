class ZipCode < ApplicationRecord
  self.table_name = "zcta5"
  
  has_many :locations
  
  def geojson
    RGeo::GeoJSON.encode(self.wkb_geometry)
  end
end