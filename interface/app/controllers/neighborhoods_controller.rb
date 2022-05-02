class NeighborhoodsController < ApplicationController
  before_action :set_neighborhood, only: [:show]

  # GET /neighborhoods
  # GET /neighborhoods.json
  def index
    @neighborhoods = Neighborhood.all.paginate(page: params[:page], per_page: 500)
  end

  # GET /neighborhoods/1
  # GET /neighborhoods/1.json
  def show
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_neighborhood
      @neighborhood = Neighborhood.find(params[:id])
    end
end
