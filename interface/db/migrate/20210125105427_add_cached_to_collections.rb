class AddCachedToCollections < ActiveRecord::Migration[5.2]
  def change
    add_column :collections, :cached, :boolean, :default => false
  end
end
