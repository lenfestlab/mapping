class CreateBertTags < ActiveRecord::Migration[5.2]
  def change
    create_table :bert_tags do |t|
      t.references :sentence, foreign_key: true
      t.string :content

      t.timestamps
    end
  end
end
