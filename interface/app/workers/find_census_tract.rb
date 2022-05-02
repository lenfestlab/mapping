class FindCensusTract
  include Sidekiq::Worker
  sidekiq_options queue: :find

  def perform(location_id)
    column_names = Location.column_names - ["wkb_geometry"]
    location = Location.select(column_names).find_by(id: location_id)
    if location == nil
      return
    end
    
    wkb_geometry = location.decode_geometry
            
    if wkb_geometry.present?
      census_tract = CensusTract.where("ST_Contains(wkb_geometry, ST_Geomfromtext('#{wkb_geometry.to_s}', 4326))").first
      if census_tract.blank?
        census_tract = CensusTract.where("ST_Contains(ST_Geomfromtext('#{wkb_geometry.to_s}', 4326), wkb_geometry)").first
      end
      location.census_tract = census_tract
      location.save
    end
  end
end