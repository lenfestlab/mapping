class ChangeAuthorToAuthorName < ActiveRecord::Migration[5.2]
  def change
    rename_column :articles, :author, :author_name
  end
end
