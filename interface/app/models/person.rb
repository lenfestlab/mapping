class Person < ApplicationRecord
  
  has_many :article_sources, :dependent => :destroy
  
end
