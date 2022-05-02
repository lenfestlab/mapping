class AddEndPositionToBertTags < ActiveRecord::Migration[5.2]
  def change
    add_column :bert_tags, :end_position, :integer
    add_column :bert_tags, :start_position, :integer
    add_column :bert_tags, :tag_type, :string, :null => false, :default => "LOC"
    add_column :bert_tags, :model_version, :string, :null => false, :default => "v1"
    add_index :bert_tags, :model_version
  end
end
