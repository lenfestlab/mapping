class CreateCountyNeighborhoods < ActiveRecord::Migration[5.2]
  def change
    create_table :county_neighborhoods do |t|
      t.timestamps
    end
  end
end
