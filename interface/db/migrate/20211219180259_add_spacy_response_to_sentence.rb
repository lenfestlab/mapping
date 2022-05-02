class AddSpacyResponseToSentence < ActiveRecord::Migration[5.2]
  def change
    add_column :sentences, :spacy_response, :jsonb, :null => false, :default => {}
  end
end
