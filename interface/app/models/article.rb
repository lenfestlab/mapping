require 'csv'

class Article < ApplicationRecord

  has_many :sentences, :dependent => :destroy
  has_many :bert_tags, :through => :sentences
  has_many :locations, :through => :bert_tags
  
  belongs_to :collection, optional: true
  
  has_many :article_locations, :dependent => :destroy

  has_many :counties, :through => :locations
  has_many :neighborhoods, :through => :locations
  has_many :census_tracts, :through => :locations
  
  has_many :article_sources, :dependent => :destroy
  has_many :people, :through => :article_sources
  
  has_many :article_authors, :dependent => :destroy
  has_many :authors, :through => :article_authors

  has_many :article_topics, :dependent => :destroy
  has_many :topics, :through => :article_topics
  
  after_save :did_save
  
  def clean_info
    info = self.info
    
    [*1..16].each do | number|
      person_id = "Person " + number.to_s
      person_name = info.delete(person_id + " NAME")
      person_race = info.delete(person_id + " RACE")
      person_gender = info.delete(person_id + " GENDER")
      person_title = info.delete(person_id + " TITLE/ID")
      person_content_type = info.delete(person_id + " CONTENT TYPE")
    
      if person_name.present?
        person = Person.new
        person.name = person_name
        person.race = person_race
        person.gender = person_gender
        person.title = person_title
        person.content_type = person_content_type
        person.save
        self.people << person
      end
    end

    self.save
  end
  
  def self.before(before)
    where('published_at <= ?', before.to_time.end_of_day)
  end

  def self.after(after)
    where('published_at >= ?', after.to_time.beginning_of_day)
  end
  
  def did_save
    if self.saved_change_to_content? or self.saved_change_to_title? or self.saved_change_to_evaluate?
      begin
        self.fetch_sentences
      rescue => err
        puts err
      end
    end
  end
  
  def text
    strings = []
    title = self.title
    if title
      title = title.gsub(/\r\n/,'')
      strings << title
      strings << '\\n'
    end
    content = self.content
    content = CGI.unescapeHTML(content)
    if content
      content = content.gsub(/\r\n/,'')
      strings << content
    end
    strings.join(" ")
  end
  
  def fetch_sentences
    if self.evaluate
      FetchSentences.perform_async(self.id)
    end
  end
  
  def author_names
    Rails.cache.fetch([self, :author_names], expires_in: 12.hours) { author_names! }
  end
  
  def author_names!
    self.authors.pluck(:name)
  end
  
  def topic_names
    Rails.cache.fetch([self, :topic_names], expires_in: 12.hours) { topic_names! }
  end
  
  def topic_names!
    self.topics.pluck(:name)
  end
  
  def self.to_csv(options = {})
    values = column_names + ["author_names"]
    CSV.generate(options) do |csv|
      csv << values
      all.each do |article|
        row = article.attributes.values_at(*column_names)
        row.push(article.author_names)
        csv << row
      end
    end
  end
  
  def self.import_file(collection_id, file)
    items = []
    CSV.foreach(file.path, headers: true) do |row|
      article_hash = row.to_hash
      ImportArticle.perform_async(collection_id, article_hash)
    end
  end
  
  def slack_post
    SlackPost.perform_async(self.id)
  end
  
  def slack_post_message    
    "*Article:* <#{self.source_url}|#{self.title}>"
  end
    
end
