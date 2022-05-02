class AddLocationBiasToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :location_bias, :string
    add_column :locations, :bias, :string
    add_index :locations, [:name, :viewbox, :bias], unique: true
    remove_index :locations, [:name, :viewbox]
  end
end
