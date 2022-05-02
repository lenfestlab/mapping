class AddGeoidToCounties < ActiveRecord::Migration[5.2]
  def change
    add_column :county, :geoid, :string
  end
end
