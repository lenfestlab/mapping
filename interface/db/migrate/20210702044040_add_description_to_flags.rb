class AddDescriptionToFlags < ActiveRecord::Migration[5.2]
  def change
    add_column :flags, :description, :string
  end
end
