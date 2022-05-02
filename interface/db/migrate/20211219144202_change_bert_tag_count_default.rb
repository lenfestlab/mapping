class ChangeBertTagCountDefault < ActiveRecord::Migration[5.2]
  def change
    change_column_default :sentences, :bert_tags_count, 0
    
  end
end
