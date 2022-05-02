class FindNeighborhood
  include Sidekiq::Worker
  sidekiq_options queue: :county

  def perform(location_id)
    location = Location.find_by(id: location_id)
    if location == nil
      return
    end
    
    if location.wkb_geometry.present?
      neighborhood = Neighborhood.where("ST_Contains(wkb_geometry, ST_Geomfromtext('#{location.wkb_geometry.to_s}', 4326))").first
      location.neighborhood = neighborhood
      location.save
      return
    end
    
    if location.latlng.present?
      neighborhood = Neighborhood.where("ST_Contains(wkb_geometry, ST_Geomfromtext('#{location.latlng.to_s}', 4326))").first
      location.neighborhood = neighborhood
      location.save
      return
    end
    
  end
end