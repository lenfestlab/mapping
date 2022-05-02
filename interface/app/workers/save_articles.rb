class SaveArticles
  include Sidekiq::Worker
  sidekiq_options queue: :urgent

  def perform(content_element, collection_id, evaluate)
    viewbox = '-74.194188332210331,40.981164736109228,-76.467791908698715,38.676157795304704'
    
    taxonomy = content_element.fetch('taxonomy', {})
    primary_section = taxonomy.fetch('primary_section', {})
    primary_section_name = primary_section.fetch('name', nil)
    website_url = content_element.fetch('website_url', '')
    promo_items = content_element.fetch('promo_items', {})
    basic = promo_items.fetch('basic', {})
    additional_properties = basic.fetch('additional_properties', {})
    thumbnailResizeUrl = additional_properties['thumbnailResizeUrl']
    source_url = 'https://www.inquirer.com' + website_url
    title = content_element['headlines']['basic']
    identifier = content_element['_id']
    publish_date = content_element['publish_date']
    first_publish_date = content_element['first_publish_date']
    
    all_content = ""
    
    elements = content_element['content_elements']
    elements.each do |element|
      content_type = element.fetch("type", "")
      if content_type == 'text'
        content = element.fetch("content", "")
        all_content += content
        all_content += " "
      end
    end
    
    all_content = ActionView::Base.full_sanitizer.sanitize(all_content)
            
    article = Article.find_or_create_by!(identifier: identifier)
    article_hash = {}
    article_hash[:title] = title
    article_hash[:thumbnail] = thumbnailResizeUrl
    article_hash[:content] = all_content
    article_hash[:viewbox] = viewbox
    article_hash[:collection_id] = collection_id
    article_hash[:identifier] = identifier
    article_hash[:source_url] = source_url
    article_hash[:published_at] = first_publish_date
    article_hash[:response] = content_element
    article_hash[:evaluate] = evaluate        
    article_hash[:analytics_channel] = content_element.dig("taxonomy","primary_section","additional_properties","original", "Analytics", "analytics_channel");
    
    article.update_attributes(article_hash)
    
    credits = content_element.fetch('credits', {})
    by = credits.fetch('by', [])
    by.each do | credit |
      name = credit.fetch('name', 'Name Parse Failure')
      author =  Author.find_or_create_by!(name: name)
      author.response = credit
      author.save
      ArticleAuthor.find_or_create_by!(article_id: article.id, author_id: author.id)
    end
    
    if primary_section_name.present?
      t = Topic.find_or_create_by!(name: primary_section_name)
      at = ArticleTopic.find_or_create_by!(topic_id: t.id, article_id: article.id)
    end
  end
    
end