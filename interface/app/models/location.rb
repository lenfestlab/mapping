class Location < ApplicationRecord
  
  after_save :did_save
  before_save :will_save
  
  belongs_to :flag, optional: true
    
  has_many :bert_tags, :dependent => :nullify
  has_many :sentences, :through => :bert_tags
  has_many :articles, :through => :sentences
  
  validates :name, uniqueness: { scope: [:viewbox, :bias] }

  belongs_to :zip_code, primary_key: 'ogc_fid', optional: true
  belongs_to :census_tract, primary_key: 'ogc_fid', optional: true
  belongs_to :county, primary_key: 'ogc_fid', optional: true
  belongs_to :neighborhood, primary_key: 'ogc_fid', optional: true
  
  def will_save
    if self.will_save_change_to_osm_results? || self.will_save_change_to_google_results? || self.will_save_change_to_use_osm?
      self.set_results
      self.set_latlng
      self.set_wkb_geometry
      self.set_formatted_address
      self.set_geometry_type
    end
    if self.will_save_change_to_county_id?
      self.county_geoid = self.county.try(:geoid)
    end
    if self.will_save_change_to_neighborhood_id?
      self.neigborhood_geoid = self.neighborhood.try(:geoid_nh)
    end
    if self.will_save_change_to_census_tract_id?
      self.census_geoid = self.census_tract.try(:geoid)
    end
    if self.will_save_change_to_zip_code_id?
      self.zipcode_geoid = self.zip_code.try(:geoid10)
    end
  end
  
  def did_save
    if self.saved_change_to_name?
      self.fetch_osm
      self.fetch_google
    end
    if self.saved_change_to_wkb_geometry?
      puts "saved_change_to_wkb_geometry"
      self.set_zip_code
      self.set_census_tract
      self.set_county
      self.set_neighborhood
    end
  end
  
  def is_gpe_or_unknown?
    if self.google_results.present?
      results = self.google_results['results']
      if results.present? && results.length > 0
        types = results[0]['types']
        if types.present? && types.length > 0
          return types.any?{|x| ["administrative_area_level_1", "administrative_area_level_2", "administrative_area_level_3", "locality", "sublocality", "neighborhood"].include?(x)}
        end
      else
        return true # is unknown
      end
    end
    
    return false
  end
    
  def fetch_results
    parsed_osm_result = self.parsed_osm_result
    parsed_google_result = self.parsed_google_result
    if self.is_gpe_or_unknown? && parsed_osm_result.present? && self.use_osm
      return parsed_osm_result
    end
    if parsed_google_result.present?
      return parsed_google_result
    end
    return parsed_osm_result
  end
  
  def set_results
    self.results = self.fetch_results
  end
  
  def parsed_google_result
    if not self.google_results.present?
      return nil
    end
    
    data = {}
    source = "unknown"
    formatted_address = nil
    lat = nil
    lng = nil
    geojson = nil
    queried_for = nil
    boundingbox = []
    type = []
    source = "google"
    results = self.google_results['results']
    if results.present? && results.length > 0
      display_name = results[0]['formatted_address']
      if display_name.present?
        formatted_address = display_name
      end
      type = results[0]['types']
      geometry = results[0]['geometry']
      if geometry.present?
        location = geometry['location']
        if location.present?
          lat = location['lat']
          lng = location['lng']
          geojson = {}
          geojson['type'] = "Point"
          geojson['coordinates'] = [ lng, lat ]
        end
        viewport = geometry['viewport']
        if viewport.present?            
          nlat = viewport['northeast']['lat']
          nlon = viewport['northeast']['lng']
          slat = viewport['southwest']['lat']
          slon = viewport['southwest']['lng']
          boundingbox =[slat, nlat, slon, nlon]
        end
      end        
    end
    
    data["source"] = source
    data["lat"] = lat
    data["lng"] = lng
    data["formatted_address"] = formatted_address
    data["type"] = type
    if queried_for.present?
      data["queried_for"] = queried_for
    end
    data["boundingbox"] = boundingbox
    if geojson.present?
      data["geojson"] = geojson
    end
    return data
  end
  
  def parsed_osm_result
    if not self.osm_results.present?
      return nil
    end
    
    if self.osm_results.length == 0
      return nil
    end
    
    data = {}
    source = "unknown"
    formatted_address = nil
    lat = nil
    lng = nil
    geojson = nil
    queried_for = nil
    boundingbox = []
    type = []
    osm_result = self.osm_results[0]
    source = "osm"
    if osm_result['type'].present?
      type = [osm_result['type']]
    end
    if osm_result['display_name'].present?
      formatted_address = osm_result['display_name']
    end
    if osm_result['lat'].present?
      lat = osm_result['lat']
    end
    if osm_result['lon'].present?
      lng = osm_result['lon']
    end
    if osm_result['geojson'].present?
      geojson = osm_result['geojson']
    end
    if osm_result['boundingbox'].present?
      boundingbox = osm_result['boundingbox']
    end
    
    data["source"] = source
    data["lat"] = lat
    data["lng"] = lng
    data["formatted_address"] = formatted_address
    data["type"] = type
    if queried_for.present?
      data["queried_for"] = queried_for
    end
    data["boundingbox"] = boundingbox
    if geojson.present?
      data["geojson"] = geojson
    end
    return data
  end
  
  def set_geometry_type
    results = self.results
    if results.blank?
      return
    end

    json = results['geojson']
    if json.present?
      geometry_type = json['type']
      if geometry_type.present?
        self.geometry_type = geometry_type
      end
    end
  end
  
  def decode_geometry
    results = self.results
    if results.blank?
      return nil
    end
    
    json = results['geojson']
    if json.present?
      factory = RGeo::Geographic.spherical_factory(:srid => 4326, :uses_lenient_assertions => true)
      geometry = RGeo::GeoJSON.decode(json, :json_parser => :json, :geo_factory => factory)
      return geometry
    end
    
    return nil
  end
  
  def set_wkb_geometry
    puts "set_wkb_geometry"
    geometry = self.decode_geometry
    if geometry.present?
      self.wkb_geometry = geometry
    end
  end
  
  def set_zip_code
    puts "set_zip_code"
    FindZipCode.perform_async(self.id)
  end
  
  def set_census_tract
    puts "set_census_tract"
    FindCensusTract.perform_async(self.id)
  end
  
  def set_county
    FindCounty.perform_async(self.id)
  end
  
  def set_neighborhood
    FindNeighborhood.perform_async(self.id)
  end
  
  def google_formatted_address
    if self.google_results.present?
      results = self.google_results['results']
      if results.present? && results.length > 0
        formatted_address = results[0]['formatted_address']
        if formatted_address.present?
          return formatted_address
        end
      end
    end
    return nil
  end
  
  def osm_formatted_address
    if self.osm_results.present? && self.osm_results.length > 0
      display_name = self.osm_results[0]['display_name']
      if display_name.present?
        return display_name
      end
    end
    return nil
  end
  
  def set_formatted_address
    results = self.results
    if results.blank?
      return
    end
    
    formatted_address = results['formatted_address']
    if formatted_address.present?
      self.formatted_address = formatted_address
    end    
  end
  
  def set_latlng
    results = self.results
    if results.blank?
      return
    end
    
    lat = results['lat']
    lng = results['lng']
    factory = RGeo::Geographic.spherical_factory(srid: 4326)

    # NOTE: this method takes the LNG parameter first!
    self.latlng = factory.point(lng, lat)
  end
  
  def fetch_osm
    if self.osm_results != nil
      return
    end
    FetchOsm.perform_async(self.id)
  end
  
  def refetch_osm
    FetchOsm.perform_async(self.id)
  end
  
  def fetch_google
    if self.google_results != nil
      return
    end
    FetchGoogle.perform_async(self.id)
  end
  
  def lat
    results = self.results
    if results.present?
      return results["lat"]
    end
    return self.latlng.lat
  end
  
  def lon
    results = self.results
    if results.present?
      return results["lng"]
    end
    return self.latlng.lon
  end
  
  def refetch_google
    FetchGoogle.perform_async(self.id)
  end
  
end
