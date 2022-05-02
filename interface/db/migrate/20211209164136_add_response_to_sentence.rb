class AddResponseToSentence < ActiveRecord::Migration[5.2]
  def change
    add_column :sentences, :response, :jsonb, :null => false, :default => {}
  end
end
