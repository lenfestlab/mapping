class CountiesController < ApplicationController
  before_action :set_county, only: [:show]

  # GET /counties
  # GET /counties.json
  def index
    @counties = County.all.paginate(page: params[:page], per_page: 500)
  end

  # GET /counties/1
  # GET /counties/1.json
  def show
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_county
      @county = County.find(params[:id])
    end
end
