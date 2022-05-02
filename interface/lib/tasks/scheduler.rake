desc "This task is called by the Heroku scheduler add-on"
task :fetch_arc => :environment do
  puts "Posting yesterday's articles to Slack..."
  since = DateTime.now - 24.hours
  neighborhood_names = ["Brewerytown","Fairhill","Strawberry Mansion","Swampoodle","Chestnut Hill","Old City","Society Hill","Center City East"]
  neighborhoods = Neighborhood.where("listname IN (?)", neighborhood_names)
  neighborhoods.pluck(:ogc_fid).each { |id| SlackPost.perform_async(id, since) }

  puts "Fetching new articles..."
  now = DateTime.now
  gte = (now - 1.days).midnight.iso8601(0)
  lt = (now + 1.days).midnight.iso8601(0)
  size = 500
  collection_id = 2
  
  body = {
    "query": {
      "bool": {
        "must_not": [
        {"match": { "taxonomy.sites._id": "/zzz-systest" }} # look into others
        ],
        "must": [
        {"match": { "type": "story" }}, 
        { "range": { "publish_date": { "gte": gte, "lt": lt }}}, # how far back is ok to go without encountering data importation issues? Mid-2018
        # { "bool": {
        #   "should": [
        #   { "match": { "taxonomy.tags.slug": "coronavirus" }}
        #   ]
        # } }
        ]
      }
    }
  }
    
  FetchArticles.perform_async(collection_id, JSON.generate(body), true, 0, size)
  puts "done."
end

task :remove_articles => :environment do
  Article.where("title ILIKE ?", "%Coronavirus Newsletter%").destroy_all
  Article.where("title ILIKE ?", "%Morning Newsletter%").destroy_all
  Article.where("source_url ILIKE ?", "%/coronavirus/live/%").destroy_all
end

task :fetch_missing_data => :environment do
  puts "Fetching missing data..."
  Location.where("google_results IS NULL").limit(10).pluck(:id).each { |id| FetchGoogle.perform_async(id) }
  Location.where("osm_results IS NULL").limit(10).pluck(:id).each { |id| FetchOsm.perform_async(id) }
  puts "done."
end