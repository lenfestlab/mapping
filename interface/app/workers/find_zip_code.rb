class FindZipCode
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
      zip_code = ZipCode.where("ST_Contains(wkb_geometry, ST_Geomfromtext('#{wkb_geometry.to_s}', 4326))").first
      if zip_code.blank?
        zip_code = ZipCode.where("ST_Contains(ST_Geomfromtext('#{wkb_geometry.to_s}', 4326), wkb_geometry)").first
      end
      location.zip_code = zip_code
      location.save
    end
  end
end