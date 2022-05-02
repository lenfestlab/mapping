class CreateSentences < ActiveRecord::Migration[5.2]
  def change
    create_table :sentences do |t|
      t.text :content
      t.jsonb :bert_tags
      t.string :identifier
      t.references :article, foreign_key: true

      t.timestamps
    end
  end
end
