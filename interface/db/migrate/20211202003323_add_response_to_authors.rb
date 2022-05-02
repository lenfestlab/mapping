class AddResponseToAuthors < ActiveRecord::Migration[5.2]
  def change
    add_column :authors, :response, :jsonb, :null => false, :default => {}
  end
end
