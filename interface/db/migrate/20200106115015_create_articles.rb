class CreateArticles < ActiveRecord::Migration[5.2]
  def change
    create_table :articles do |t|
      t.string :title
      t.text :content
      t.jsonb :sentences
      t.jsonb :results

      t.timestamps
    end
  end
end
