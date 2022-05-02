class State < ApplicationRecord
  self.table_name = "admin1_us"
  
  has_one :state_county
  has_many :counties, :through => :state_county
  
  def locations
    Location.where("ST_Contains(ST_Geomfromtext('#{self.wkb_geometry.to_s}'), wkb_geometry)")
  end
  
  def geojson
    RGeo::GeoJSON.encode(self.wkb_geometry)
  end
end