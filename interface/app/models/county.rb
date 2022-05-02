class County < ApplicationRecord
  self.table_name = "county"
  
  has_many :locations
  has_many :articles, :through => :locations
  
  has_many :county_neighborhoods
  has_many :neighborhoods, :through => :county_neighborhoods
  
  has_one :state_county
  has_one :state, :through => :state_county
  
  delegate :state_code, to: :state, allow_nil: true
   
  def description
    strings = [name]
    code = state.try(:state_code)
    if code
      strings << code
    end
    strings.join(', ')
  end
  
  def find_state
    begin
      return State.where("ST_Contains(wkb_geometry, ST_Geomfromtext('#{self.wkb_geometry.to_s}', 4326))").first
    rescue
      return nil
    rescue Exception
      return nil
    end
  end
  
  def geojson
    RGeo::GeoJSON.encode(self.wkb_geometry)
  end
end