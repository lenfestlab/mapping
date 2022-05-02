class AddAnalyticsChannelToArticles < ActiveRecord::Migration[5.2]
  def change
    add_column :articles, :analytics_channel, :string
  end
end
