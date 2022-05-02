class AddEndCharAndStartCharToSentences < ActiveRecord::Migration[5.2]
  def change
    add_column :sentences, :start_char, :integer, :default => 0
    add_column :sentences, :end_char, :integer, :default => 0
  end
end
