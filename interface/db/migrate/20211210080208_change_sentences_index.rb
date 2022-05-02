class ChangeSentencesIndex < ActiveRecord::Migration[5.2]
  def change
    remove_index :sentences, name: "index_sentences_on_article_id_and_content"
    add_index :sentences, [:article_id, :content, :position], unique: true
  end
end
