class AddNerResponseToSentences < ActiveRecord::Migration[5.2]
  def change
    add_column :sentences, :ner_response, :jsonb, :null => false, :default => {}
  end
end
