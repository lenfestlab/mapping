from flask import Flask, render_template, redirect, url_for, request

app = Flask(__name__)

import os
MAPBOX_ACCESS_TOKEN = os.getenv("MAPBOX_ACCESS_TOKEN")

@app.route('/collections/<collectionId>')
def hello(collectionId):
    mapbox_access_token = MAPBOX_ACCESS_TOKEN
    return render_template('collection.html', collectionId=collectionId, mapbox_access_token=mapbox_access_token)

@app.route('/data-files/<filename>')
def datafiles(filename):
  return redirect(url_for('static', filename= 'data-files/' + filename))

@app.route('/visualize/<dataSource>/<geoId>')
def countyData(dataSource, geoId):
  if geoId is None:
    return "Missing geoId"
        
  pointsURL = "https://lenfest-mapping.herokuapp.com/collections/13/points.json?model_version=v2&zipcode=" + geoId
  
  before = request.args.get('before')
  if before:
    pointsURL = pointsURL + "&before=" + before
    
  after = request.args.get('after')
  if after:
    pointsURL = pointsURL + "&after=" + after
  
  pointsURL = pointsURL + "&"

  mapbox_access_token = MAPBOX_ACCESS_TOKEN
  return render_template('data.html', geoId=geoId, dataSource=dataSource, pointsURL=pointsURL, mapbox_access_token=mapbox_access_token)

