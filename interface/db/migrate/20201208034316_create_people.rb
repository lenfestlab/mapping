class CreatePeople < ActiveRecord::Migration[5.2]
  def change
    create_table :people do |t|
      t.string :name
      t.string :race
      t.string :gender
      t.string :title
      t.string :content_type

      t.timestamps
    end
  end
end
