class StateCounty < ApplicationRecord
  belongs_to :state, optional: true
  belongs_to :county
end
