class ZipCodesController < ApplicationController
  before_action :set_zip_code, only: [:show]

  # GET /zip_codes
  # GET /zip_codes.json
  def index
    ids = Location.where("zip_code_id IS NOT NULL").pluck(:zip_code_id)
    @zip_codes = ZipCode.where("ogc_fid IN (?)", ids)
  end

  # GET /zip_codes/1
  # GET /zip_codes/1.json
  def show
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_zip_code
      @zip_code = ZipCode.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def zip_code_params
      params.require(:zip_code).permit(:name, :country)
    end
end
