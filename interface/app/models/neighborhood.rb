class Neighborhood < ApplicationRecord
  
  has_many :county_neighborhoods
  has_many :counties, :through => :county_neighborhoods
  has_many :locations
  has_many :articles, :through => :locations
  
end
