class ArticleLocationsController < ApplicationController
  before_action :set_article_location, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!, only: [:show, :edit, :update]
  
  # GET /article_locations
  # GET /article_locations.json
  def index
    @article_locations = ArticleLocation.all.paginate(page: params[:page], per_page: params[:per_page])
    
    if params[:comment].present?
      comment = params[:comment]
      if comment
        @article_locations = @article_locations.where("article_locations.comment ILIKE ?", "%#{comment}%")
      end
    end
    
    if params[:flagged].present?
      flagged = ActiveRecord::Type::Boolean.new.deserialize(params[:flagged])
      if flagged
        @article_locations = @article_locations.joins(:location).where("article_locations.flagged = true OR locations.flagged = true")
      else
        @article_locations = @article_locations.joins(:location).where("article_locations.flagged = false AND locations.flagged = false")
      end
    end
    
    if params[:flag].present?
      flag = ActiveRecord::Type::Boolean.new.deserialize(params[:flag])
      if flag
        @article_locations = @article_locations.where("article_locations.flag_id IS NOT NULL OR locations.flag_id IS NOT NULL")
      else
        @article_locations = @article_locations.where("article_locations.flag_id IS NULL AND locations.flag_id IS NULL")
      end
    end
    
    respond_to do |format|
      format.html
      format.json
      format.csv { send_data @article_locations.to_csv }
    end
  end

  # GET /article_locations/1
  # GET /article_locations/1.json
  def show
  end

  # GET /article_locations/new
  def new
    @article_location = ArticleLocation.new
  end

  # GET /article_locations/1/edit
  def edit
  end

  # POST /article_locations
  # POST /article_locations.json
  def create
    @article_location = ArticleLocation.new(article_locations_params)

    respond_to do |format|
      if @article_location.save
        format.html { redirect_to @article_location, notice: 'Article Location was successfully created.' }
        format.json { render :show, status: :created, location: @article_location }
      else
        format.html { render :new }
        format.json { render json: @article_location.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /article_locations/1
  # PATCH/PUT /article_locations/1.json
  def update
    respond_to do |format|
      if @article_location.update(article_location_params)
        format.html { redirect_to @article_location, notice: 'Article was successfully updated.' }
        format.json { render :show, status: :ok, location: @article_location }
      else
        format.html { render :edit }
        format.json { render json: @article_location.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /article_locations/1
  # DELETE /article_locations/1.json
  def destroy
    @article_location.destroy
    respond_to do |format|
      format.html { redirect_back fallback_location: root_path, notice: 'Article Location was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_article_location
      @article_location = ArticleLocation.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def article_location_params
      params.require(:article_location).permit(:location_id, :article_id, :flagged, :comment, :flag_id)
    end
end
