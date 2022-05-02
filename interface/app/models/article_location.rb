class ArticleLocation < ApplicationRecord
  belongs_to :article, :counter_cache => true
  belongs_to :location
  belongs_to :flag, optional: true
  
  after_commit :flush_cache

  def flush_cache
    Rails.cache.delete([self, :snippet])
  end
  
  def self.before(before)
    where('articles.published_at <= ?', before.to_time.end_of_day)
  end

  def self.after(after)
    where('articles.published_at >= ?', after.to_time.beginning_of_day)
  end
    
  def snippet
    Rails.cache.fetch([self, :snippet], expires_in: 12.hours) { snippet! }
  end
  
  def snippet!
    name = location.name
    name = name.gsub(/['’]/i, "'")
    regex = Regexp.new(Regexp.escape(name))
    text = nil
    data = nil
    article.sentences.each do | sentence |
      content = sentence.content
      content = content.gsub(/['’]/i, "'")
      data = content.match(regex)
      if not data.blank?
        text = content
        break
      end
    end
    
    if text.blank?
      return ""
    end

    if data.blank?
      return ""
    end

    offset = data.offset(0)

    startpadding = 20
    endpadding = 75

    length = text.length

    starting = [0, offset[0] - startpadding].max
    ending = [length, offset[1] + endpadding].min

    return "...#{text}..."
  end
end
