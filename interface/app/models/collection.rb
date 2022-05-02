class Collection < ApplicationRecord
  
  before_save :will_save
  
  has_many :articles
  has_many :sentences, :through => :articles
  has_many :bert_tags, :through => :sentences
  has_many :locations, :through => :bert_tags
  has_many :article_locations, :through => :articles
  has_many :zip_codes, :through => :locations
    
  validates_numericality_of :max_lat, :greater_than => :min_lat, :allow_nil => true
  validates_numericality_of :max_lng, :greater_than => :min_lng, :allow_nil => true
  
  def filtered_point_ids
    Rails.cache.fetch([self, :filtered_point_ids], expires_in: 2.minutes) { filtered_point_ids! }
  end
  
  def filtered_point_ids!
    if self.bounds.blank?
      return self.point_ids
    end      
    return self.locations.where("geometry_type = ?", "Point").where("ST_Contains(ST_Geomfromtext('#{self.bounds.to_s}', 4326), wkb_geometry)").pluck(:id)
  end
  
  def point_ids(model_version)
    Rails.cache.fetch([self, :point_ids, model_version], expires_in: 2.minutes) { point_ids!(model_version) }
  end
  
  def point_ids!(model_version)
    articles = self.articles
    return Sentence.joins(:bert_tags).where("model_version = ? AND location_id IS NOT NULL AND article_id IN (?)", model_version, articles.pluck(:id).uniq).pluck(:location_id).uniq
  end
  
  def will_save
    if self.lat_changed? || self.lng_changed?
      self.set_center
    end
  end
  
  def max_bounds
    if self.min_lat.blank? || self.min_lng.blank? || self.max_lat.blank? || self.max_lng.blank?
      return nil
    end
    return [[self.min_lng.to_f, self.min_lat.to_f], [self.max_lng.to_f,  self.max_lat.to_f]]
  end
  
  def bounds
    if self.min_lat.blank? || self.min_lng.blank? || self.max_lat.blank? || self.max_lng.blank?
      return nil
    end
    factory = RGeo::Geographic.spherical_factory(:srid => 4326, :uses_lenient_assertions => true)    
    point1 = factory.point(self.min_lng, self.min_lat) 
    point2 = factory.point(self.max_lng, self.max_lat) 
    boundingBox = RGeo::Cartesian::BoundingBox.create_from_points(point1, point2).to_geometry 
    return boundingBox
  end
    
  def viewbox
    if self.min_lat.blank? || self.min_lng.blank? || self.max_lat.blank? || self.max_lng.blank?
      return nil
    end
    return [self.min_lat.to_f, self.min_lng.to_f, self.max_lat.to_f,  self.max_lng.to_f].join(",")
  end
  
  def bias
    "#{self.lat},#{self.lng}"
  end
  
  def set_center
    lat = self.lat
    lng = self.lng
    factory = RGeo::Geographic.spherical_factory(srid: 4326)

    # NOTE: this method takes the LNG parameter first!
    self.center = factory.point(lng, lat)
  end
  
end
