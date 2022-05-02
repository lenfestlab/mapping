class CreateArticleTopics < ActiveRecord::Migration[5.2]
  def change
    create_table :article_topics do |t|
      t.references :article, foreign_key: true
      t.references :topic, foreign_key: true

      t.timestamps
    end
  end
end
