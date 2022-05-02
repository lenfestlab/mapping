class CollectionsController < ApplicationController
  before_action :authenticate_user!, only: [:index, :map]
  before_action :set_collection, only: [:location, :neighborhoods, :topics, :authors, :info, :show, :edit, :update, :destroy, :article_locations, :articles, :simple_articles, :points, :counties, :locations, :map, :zip_codes, :census_tracts, :polys, :tasks]
  before_action :set_featured, only: [:featured, :featured_articles, :featured_article_locations]
  caches_action :counties, :cache_path => Proc.new { |c| c.request.url }, expires_in: 24.hour
  caches_action :neighborhoods
  caches_action :topics
  caches_action :authors
  caches_action :zip_codes
  caches_action :census_tracts
  caches_action :points, :if => Proc.new { |c| @collection.cached }, :cache_path => Proc.new { |c| c.request.url }
  
  def import
    Article.import_file(params[:id], params[:file])
    redirect_to root_url, notice: "Articles imported."
  end
  
  # GET /collections
  # GET /collections.json
  def index
    @collections = Collection.all
  end
  
  # GET /collections/1/map
  def map
    redirect_to "https://coverage-analysis.herokuapp.com/collections/#{@collection.id}"
  end
  
  # GET /collections/1/locations
  def locations
    @locations = @collection.locations
  end
  
  # GET /collections/1/locations/1
  def location
    response.headers.delete "X-Frame-Options"
    
    location_id = params[:location_id]
    @location = @collection.locations.where("locations.id = ?", location_id).first

    article_ids = @collection.article_ids
    article_ids = ArticleLocation.where("article_id IN (?) AND location_id = ?", article_ids, location_id).pluck(:article_id)
    @articles = Article.where("id IN (?)", article_ids)
  end
  
  # GET /collections/1/counties
  def counties
    if params[:county_ids]
      ids = params[:county_ids].split(',').map(&:to_i)
    else
      @locations = @collection.locations
      ids = @locations.pluck(:county_id)
    end
    @counties = County.where("ogc_fid IN (?)", ids).where("geoid IS NOT NULL")
  end
  
  # GET /collections/1/neighborhoods
  def neighborhoods
    @locations = @collection.locations
    ids = @locations.pluck(:neighborhood_id)
    @neighborhoods = Neighborhood.where("ogc_fid IN (?)", ids).where("geoid_nh IS NOT NULL")
  end
  
  # GET /collections/1/featured
  def featured
    respond_to do |format|
      format.html { redirect_to controller: 'collections', action: 'counties', id: params[:id], county_ids: @featured_county_ids, before: @featured_before, after: @featured_after, format: "html", per_page: 4 }
      format.json { redirect_to controller: 'collections', action: 'counties', id: params[:id], county_ids: @featured_county_ids, before: @featured_before, after: @featured_after, format: "json" }
    end
  end
  
  # GET /collections/1/featured_articles
  def featured_articles
    respond_to do |format|
      format.html { redirect_to controller: 'collections', action: 'articles', id: params[:id], county_ids: @featured_county_ids, before: @featured_before, after: @featured_after, format: "html", per_page: 4 }
      format.json { redirect_to controller: 'collections', action: 'articles', id: params[:id], county_ids: @featured_county_ids, before: @featured_before, after: @featured_after, format: "json" }
    end
  end
    
  def featured_article_locations
    respond_to do |format|
      format.html { redirect_to controller: 'collections', action: 'article_locations', id: params[:id], county_ids: @featured_county_ids, before: params[:before], after: params[:after], format: "html", per_page: 4 }
      format.json { redirect_to controller: 'collections', action: 'article_locations', id: params[:id], county_ids: @featured_county_ids, before: params[:before], after: params[:after], format: "json" }
    end
  end
  
  # GET /collections/1/zip_codes
  def zip_codes
    ids = @collection.locations.where("zip_code_id IS NOT NULL").pluck(:zip_code_id)
    @zip_codes = ZipCode.where("ogc_fid IN (?)", ids).pluck(:zcta5ce10)
    render json: @zip_codes.uniq
  end
  
  # GET /collections/1/authors
  def authors
    author_ids = ArticleAuthor.where("article_id IN (?)", @collection.article_ids).pluck(:author_id)
    @authors = Author.where("id IN (?)", author_ids)
  end
  
  # GET /collections/1/topics
  def topics
    topic_ids = ArticleTopic.where("article_id IN (?)", @collection.article_ids).pluck(:topic_id)
    @topics = Topic.where("id IN (?)", topic_ids)
  end
  
  # GET /collections/1/census_tracts
  def census_tracts
    ids = @collection.locations.where("census_tract_id IS NOT NULL").pluck(:census_tract_id)
    @census_tracts = CensusTract.where("ogc_fid IN (?)", ids).where("geoid IS NOT NULL")
  end

  # GET /collections/1/points.json
  def points    
    model_version = params.fetch(:model_version, "v1")
    if params[:before] or params[:after]
      articles = @collection.articles
      if params[:before]
       articles = articles.before(params[:before])
      end
      if params[:after]
       articles = articles.after(params[:after])
      end
      point_ids = Sentence.joins(:bert_tags).where("model_version = ? AND location_id IS NOT NULL AND article_id IN (?)", model_version, articles.pluck(:id).uniq).pluck(:location_id).uniq
    else
      point_ids = @collection.point_ids(model_version)
    end
    
    @locations = Location.where("id IN (?)", point_ids).where("geometry_type = ?", "Point")

    if params[:bind].present? and @collection.bounds.present?
      @locations = @locations.where("ST_Contains(ST_Geomfromtext('#{@collection.bounds.to_s}', 4326), wkb_geometry)")
    end
        
    if params[:zipcode].present?
      zipcode = ZipCode.find_by_zcta5ce10(params[:zipcode])
      @locations = @locations.where("zip_code_id = ?", zipcode.ogc_fid)
    end        
  
    if params[:neighborhood_id].present?
      @locations = @locations.where("neighborhood_id =?", params[:neighborhood_id])
    end
        
    @locations = @locations.paginate(page: params[:page], per_page: params[:per_page])
      
    respond_to do |format|
       format.xlsx
       format.json { render json: PointBlueprint.render(@locations) }
     end
  end
  
  # GET /collections/1/polys.json
  def polys
    @locations = @collection.locations.where("geometry_type != ?", "Point").uniq
    features = @locations.map { |val| val.feature }
    
    render json: {
        "type": "FeatureCollection",
        "name": "clip-points-co-ct-nh",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": features
      }
    
  end
  
  # GET /collections/1/article_locations
  # GET /collections/1/article_locations.json
  def article_locations
    article_locations = @collection.article_locations
    if params[:before]
     article_locations = article_locations.joins(:location).before(params[:before])
    end
    if params[:after]
     article_locations = article_locations.joins(:location).after(params[:after])
    end
    if params[:county_ids]
      ids = params[:county_ids].split(',').map(&:to_i)
      article_locations = article_locations.where("county_id IN (?)", ids)
    end
    if params[:flagged].present?
      flagged = ActiveRecord::Type::Boolean.new.deserialize(params[:flagged])
      if flagged
        article_locations = article_locations.where("article_locations.flagged = true OR locations.flagged = true")
      else
        article_locations = article_locations.where("article_locations.flagged = false AND locations.flagged = false")
      end
    end
    
    @article_locations = article_locations.includes(:article, :location).order("locations.county_id, locations.id")
  end
  
  # GET /collections/1/articles
  # GET /collections/1/articles.json
  def articles
    articles = @collection.articles
    if params[:before]
     articles = articles.before(params[:before])
    end
    if params[:after]
     articles = articles.after(params[:after])
    end
    if params[:county_ids]
      ids = params[:county_ids].split(',').map(&:to_i)
      articles = articles.where("locations.county_id IN (?)", ids)
    end
    articles = articles.includes(:article_locations => :location)
    articles = articles.joins(:article_locations => :location)
    if params[:flagged].present?
      flagged = ActiveRecord::Type::Boolean.new.deserialize(params[:flagged])
      if flagged
        articles = articles.where("article_locations.flagged = true OR locations.flagged = true")
      else
        articles = articles.where("article_locations.flagged = false AND locations.flagged = false")
      end
    end  
    @articles = articles.order("published_at DESC")
  end
  
  # GET /collections/1/simple_articles
  # GET /collections/1/simple_articles.json
  def simple_articles
    articles = @collection.articles
    
    if params[:zipcode].present?
      articles = articles.joins(:article_locations => :location)
      zipcode = ZipCode.find_by_zcta5ce10(params[:zipcode])
      articles = articles.where("locations.zip_code_id = ?", zipcode.ogc_fid)
    end
    if params[:before]
     articles = articles.before(params[:before])
    end
    if params[:after]
     articles = articles.after(params[:after])
    end
    if params[:county_ids]
      ids = params[:county_ids].split(',').map(&:to_i)
      articles = articles.where("locations.county_id IN (?)", ids)
    end
    if params[:flagged].present?
      articles = articles.includes(:article_locations => :location)
      articles = articles.joins(:article_locations => :location)
      flagged = ActiveRecord::Type::Boolean.new.deserialize(params[:flagged])
      if flagged
        articles = articles.where("article_locations.flagged = true OR locations.flagged = true")
      else
        articles = articles.where("article_locations.flagged = false AND locations.flagged = false")
      end
    end  
        
    count = articles.count
    
    articles = articles.joins(:article_topics, :article_authors).select('articles.updated_at, articles.id, articles.title, articles.source_url, articles.identifier, articles.published_at, articles.thumbnail, articles.info, array_agg(article_topics.topic_id) topic_ids_array, array_agg(article_authors.author_id) author_ids_array').group('articles.updated_at, articles.id, articles.title, articles.source_url, articles.identifier, articles.published_at, articles.thumbnail, articles.info')
    
    @articles = articles.order("published_at DESC").paginate(page: params[:page], per_page: params[:per_page])
    
    render json: ArticleBlueprint.render(@articles, root: :articles, meta: { count: count })    
  end

  # GET /collections/1/tasks
  # GET /collections/1/tasks.json
  def tasks
    articles = @collection.articles
    if params[:before]
     articles = articles.before(params[:before])
    end
    if params[:after]
     articles = articles.after(params[:after])
    end
    if params[:county_ids]
      ids = params[:county_ids].split(',').map(&:to_i)
      articles = articles.where("locations.county_id IN (?)", ids)
    end
    if params[:flagged].present?
      articles = articles.includes(:article_locations => :location)
      articles = articles.joins(:article_locations => :location)
      flagged = ActiveRecord::Type::Boolean.new.deserialize(params[:flagged])
      if flagged
        articles = articles.where("article_locations.flagged = true OR locations.flagged = true")
      else
        articles = articles.where("article_locations.flagged = false AND locations.flagged = false")
      end
    end  
    @articles = articles.order("published_at DESC").paginate(page: params[:page], per_page: params[:per_page])
  end

  # GET /collections/1
  # GET /collections/1.json
  def show
    @articles = @collection.articles.order("published_at DESC").paginate(page: params[:page], per_page: params[:per_page])
    respond_to do |format|
      format.html
      format.json { render json: @collection }
      format.csv { send_data @collection.articles.order("published_at DESC").to_csv }
    end
  end
  
  # GET /collections/1/info
  def info
    articles = @collection.articles
    if params[:before]
     articles = articles.before(params[:before])
    end
    if params[:after]
     articles = articles.after(params[:after])
    end
    
    respond_to do |format|
      format.html
      format.json { render json: CollectionBlueprint.render({ collection: @collection, articles: articles }) }
      format.csv { send_data @collection.articles.order("published_at DESC").to_csv }
    end
  end

  # GET /collections/new
  def new
    @collection = Collection.new
  end

  # GET /collections/1/edit
  def edit
  end

  # POST /collections
  # POST /collections.json
  def create
    @collection = Collection.new(collection_params)

    respond_to do |format|
      if @collection.save
        format.html { redirect_to @collection, notice: 'Collection was successfully created.' }
        format.json { render :show, status: :created, location: @collection }
      else
        format.html { render :new }
        format.json { render json: @collection.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /collections/1
  # PATCH/PUT /collections/1.json
  def update
    respond_to do |format|
      if @collection.update(collection_params)
        format.html { redirect_to edit_collection_path(@collection), notice: 'Collection was successfully updated.' }
        format.json { render :show, status: :ok, location: @collection }
      else
        format.html { render :edit }
        format.json { render json: @collection.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /collections/1
  # DELETE /collections/1.json
  def destroy
    @collection.destroy
    respond_to do |format|
      format.html { redirect_to collections_url, notice: 'Collection was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    def set_featured
      ids = [2242, 2275, 2282, 1768, 1770, 1771, 1772, 1773, 1775, 1778, 1784, 2245, 2251, 2259, 2279, 2284, 2287]
      @featured_county_ids = ids.map(&:inspect).join(', ')
      @featured_before = '2020-5-28'
      @featured_after = '2020-5-22'
    end
  
    # Use callbacks to share common setup or constraints between actions.
    def set_collection
      @collection = Collection.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def collection_params
      params.require(:collection).permit(:name, :lat, :lng, :min_lat, :min_lng, :max_lat, :max_lng, :km_radius)
    end
end
