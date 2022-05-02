class CountyNeighborhood < ApplicationRecord
  belongs_to :county
  belongs_to :neighborhood
end
