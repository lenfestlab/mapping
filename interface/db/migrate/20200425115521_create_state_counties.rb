class CreateStateCounties < ActiveRecord::Migration[5.2]
  def change
    create_table :state_counties do |t|
      t.bigint "county_id"
      t.index ["county_id"], name: "index_state_counties_on_county_id"
      t.bigint "state_id"
      t.index ["state_id"], name: "index_state_counties_on_state_id"
      t.timestamps
    end
  end
end
