class AddArticleLocationsCountToArticles < ActiveRecord::Migration[5.2]
  def self.up
    add_column :articles, :article_locations_count, :integer, :default => 0

    Article.reset_column_information
    Article.all.each do |a|
      Article.update_counters a.id, :article_locations_count => a.article_locations.length
    end
  end

  def self.down
    remove_column :projects, :tasks_count
  end
end
