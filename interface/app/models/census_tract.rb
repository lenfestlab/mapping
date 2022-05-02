class CensusTract < ApplicationRecord
  self.table_name = "census"
  
  has_many :locations
  
  def geojson
    RGeo::GeoJSON.encode(self.wkb_geometry)
  end
end