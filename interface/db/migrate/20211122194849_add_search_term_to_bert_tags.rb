class AddSearchTermToBertTags < ActiveRecord::Migration[5.2]
  def change
    add_column :bert_tags, :search_term, :string
    BertTag.update_all("search_term=content")
  end
end
