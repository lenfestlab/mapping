class Flag < ApplicationRecord
  
  has_many :article_locations, :dependent => :nullify
  has_many :locations, :dependent => :nullify
  
  def detail
    "#{self.reason}: #{self.description}"
  end
  
end
