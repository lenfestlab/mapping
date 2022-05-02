class Topic < ApplicationRecord
  
  has_many :article_topics, :dependent => :destroy
  has_many :articles, :through => :article_topics
  
end
