class AddTopicNameToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :topic_name, :string
  end
end
