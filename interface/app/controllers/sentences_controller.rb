class SentencesController < ApplicationController
  before_action :set_sentence, only: [:show]
  before_action :authenticate_user!, only: [:show]

  # GET /sentences/1
  # GET /sentences/1.json
  def show
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_sentence
      @sentence = Sentence.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def sentence_params
      params.require(:sentence).permit(:content)
    end
end
