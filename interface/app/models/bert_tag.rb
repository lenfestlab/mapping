class BertTag < ApplicationRecord
  belongs_to :sentence, counter_cache: true
  belongs_to :location, optional: true
  
  after_save :update_counter_cache
  after_destroy :update_counter_cache

  def update_counter_cache
    if self.location.present?
      self.location.article_identifiers = self.location.articles.pluck(:identifier).uniq
      self.location.save
    end
  end
  
  after_create :create_location
  
  def create_location
    CreateLocations.perform_async(self.id)
  end
  
end
