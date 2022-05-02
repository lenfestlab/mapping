class FindCounty
  include Sidekiq::Worker
  sidekiq_options queue: :county

  def perform(location_id)
    column_names = Location.column_names - ["wkb_geometry"]
    location = Location.select(column_names).find_by(id: location_id)
    if location == nil
      return
    end
            
    # Find by looking at address
    formatted_address = location.formatted_address
    if formatted_address.present?
      county_name = location.formatted_address.split(", ").grep(/ county/i)[0]
      if county_name.present?
        county_name = county_name.gsub(" County", '') 
        counties = County.where("name = ?", county_name)
        if counties.count == 1
          location.county = counties.first
          location.save
          return
        end
      end
    end
    
    wkb_geometry = location.decode_geometry
    
    if wkb_geometry.present?
      county = County.where("ST_Contains(wkb_geometry, ST_Geomfromtext('#{wkb_geometry.to_s}', 4326))").first
      location.county = county
      location.save
      return
    end
    
    if location.latlng.present?
      county = County.where("ST_Contains(wkb_geometry, ST_Geomfromtext('#{location.latlng.to_s}', 4326))").first
      location.county = county
      location.save
      return
    end
    
  end
end