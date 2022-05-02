class BertTagsController < ApplicationController
  before_action :set_bert_tag, only: [:edit, :update]
  before_action :authenticate_user!, only: [:edit, :update]

  # GET /bert_tags/1/edit
  def edit
  end

  # PATCH/PUT /bert_tags/1
  # PATCH/PUT /bert_tags/1.json
  def update
    respond_to do |format|
      if @bert_tag.update(bert_tag_params)
        format.html { redirect_to edit_bert_tag_path(@bert_tag), notice: 'BertTag was successfully updated.' }
        format.json { render :show, status: :ok, location: @bert_tag }
      else
        format.html { render :edit }
        format.json { render json: @bert_tag.errors, status: :unprocessable_entity }
      end
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_bert_tag
      @bert_tag = BertTag.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def bert_tag_params
      params.require(:bert_tag).permit(:search_term)
    end
end
