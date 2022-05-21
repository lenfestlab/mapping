from flask import Flask, flash, redirect, render_template, request, session, abort, redirect, jsonify
import os
import ast
import pandas as pd
import json
from predict import data_prep
from predict import bert_model_predict
from cpu_modeling import from_pretrained
from transformers import BertForTokenClassification, AdamW
import urllib.parse
import geocoder
import spacy

nlp = spacy.load("en_core_web_sm")

# model = from_pretrained(BertForTokenClassification, "noah-rush/inquirer-bert", num_labels=4)
model = BertForTokenClassification.from_pretrained("noah-rush/inquirer-bert")

app = Flask(__name__, static_url_path='')

@app.route("/geojson", methods=['POST'])
def geojson():
  query = request.form.get('name')  
  viewbox = request.form.get('viewbox')  

  result = geocoder.get_location(nlp, query, viewbox)
  if result == None:
    return ('', 204)
    
  return result
  
@app.route("/", methods=['POST'])
def evaluate(text):
  # text = request.form.get('content')
  text = urllib.parse.unquote_plus(text)
  doc = nlp(text)
  spacy_tokens = [token.text for token in doc]
  bert_tags = bert_model_predict.single_bert_prediction(model, spacy_tokens)
  result = { "content" : text, "bert_tags": bert_tags }
  return jsonify(results = result)
  
@app.route("/entities", methods=['POST'])
def entities():
  text = request.form.get('content')
  text = urllib.parse.unquote_plus(text)
    
  doc = nlp(text)
  ents = []
  for ent in doc.ents:
      ents.append({'text':ent.text,  'start_char':ent.start_char, 'end_char': ent.end_char, 'label_': ent.label_})  
  
  result = { "content" : text, "ents": ents }
  return jsonify(results = result)
  
@app.route("/sentences", methods=['POST'])
def sentences():
  content = request.form.get('content')  
  # content = content.encode("iso-8859-1").decode("unicode_escape")
  
  result = {}
  result["content"] = content

  #Data Prep
  print('Preparing Data...')
  articles_sent_df = data_prep.break_article_into_sentences(nlp, content)
  result = articles_sent_df.to_json(index=True, orient='records')
  return result

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
    # evaluate('Has school reform broken the cycle of poverty in Camden , N.J. ?')