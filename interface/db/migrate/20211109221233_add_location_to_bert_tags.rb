class AddLocationToBertTags < ActiveRecord::Migration[5.2]
  def change
    add_reference :bert_tags, :location, foreign_key: true
  end
end
