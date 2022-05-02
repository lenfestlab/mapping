class AddGenderAndRaceToAuthors < ActiveRecord::Migration[5.2]
  def change
    add_column :authors, :gender, :string
    add_column :authors, :race, :string
  end
end
