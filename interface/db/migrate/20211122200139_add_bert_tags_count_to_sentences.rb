class AddBertTagsCountToSentences < ActiveRecord::Migration[5.2]
  def change
    add_column :sentences, :bert_tags_count, :integer
    BertTag.pluck(:sentence_id).uniq.each do |sentence_id|
      Sentence.reset_counters(sentence_id, :bert_tags)
    end
  end
end
