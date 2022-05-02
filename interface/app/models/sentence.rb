class Sentence < ApplicationRecord
  belongs_to :article
  
  after_save :did_save
  
  has_many :bert_tags, :dependent => :destroy
  has_many :locations, :through => :bert_tags
  
  def did_save
    if self.saved_change_to_content?
      begin
        self.fetch_locations
      rescue => err
        puts err
      end
    end
  end
  
  def fetch_locations
    ExtractSpacyEntities.perform_async(self.id)
    ExtractBertEntities.perform_async(self.id)
  end  
  
end
