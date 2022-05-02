import os
import pandas as pd
import numpy as np
from flask import Flask, render_template, send_from_directory, jsonify
from flask_cors import CORS
from scipy import stats
import statsmodels.api as sm
import math

app = Flask(__name__)
cors = CORS(app)

@app.route('/')
def index():
    heap_app_id = os.environ.get("HEAP_APP_ID", default=None)
    google_tracking_id = os.environ.get("GOOGLE_TRACKING_ID", default=None)
    return render_template('index.html', heap_app_id=heap_app_id, google_tracking_id=google_tracking_id)

@app.route('/javascripts/<path:path>')
def send_javascripts(path):
    return send_from_directory('javascripts', path)
    
@app.route('/images/<path:path>')
def send_images(path):
    return send_from_directory('images', path)
    
@app.route('/stylesheets/<path:path>')
def send_stylesheets(path):
    return send_from_directory('stylesheets', path)
    
@app.route('/nj/statistics.json')
def nj_statistics():
    date = '2020-07-23'
    
    array = []
      
    cr_cases = pd.read_csv('https://interactives.data.spotlightpa.org/2020/coronavirus/data/inquirer/nj-nyt-cases.csv')
    cr_cases = cr_cases.set_index('Date')
    cr_cases = cr_cases.fillna(0)
    
    cr_pop = pd.read_csv('https://interactives.data.spotlightpa.org/2020/coronavirus/data/inquirer/pop/nj-county-pop.csv')
    cr_pop = cr_pop.set_index('name')
    cr_pop = cr_pop.fillna(0)
      
    for column in cr_pop.index:
      data = county_statistics(column, cr_cases, cr_pop, "NJ")
      array.append(data)
      
    return jsonify(array)
        
@app.route('/pa/statistics.json')
def pa_statistics():
    date = '2020-07-23'
    
    array = []
    
    cr_cases = pd.read_csv('https://interactives.data.spotlightpa.org/2020/coronavirus/data/inquirer/pa-cases.csv')
    cr_cases = cr_cases.set_index('Date')
    cr_cases = cr_cases.fillna(0)
        
    cr_pop = pd.read_csv('https://interactives.data.spotlightpa.org/2020/coronavirus/data/inquirer/pop/pa-county-pop.csv')
    cr_pop = cr_pop.set_index('name')
    cr_pop = cr_pop.fillna(0)
        
    for column in cr_pop.index:
      data = county_statistics(column, cr_cases, cr_pop, "PA")
      array.append(data)
      
    return jsonify(array)
    
def county_statistics(column, cr_cases, cr_pop, state_code):
    cases = cr_cases[column]
    total_cases = cases.iloc[-1]
    population = cr_pop['population'].get(column, 0)
    county_key = county_key_name(column, state_code)
    diff = cases.diff()
    rolling = diff.rolling(window=7).mean()
    values = rolling.iloc[7:].values
    index = diff.iloc[7:].index
    number_recent_days = 14
    recent_days = rolling.values[-number_recent_days:]
    recent_days = values[-number_recent_days:]
    yVals = rolling[-14:].tolist()
    xVals = np.arange(number_recent_days)
    slope, intercept, r_value, p_value, std_err = stats.linregress(xVals, yVals)
    percent = np.arctan(slope)
    trend = "Unclear"
    
    mVal = np.linalg.lstsq(np.vstack([xVals, np.ones(len(xVals))]).T, yVals)[0][0]
    
    df = len(xVals) - 2;
    
    r = np.corrcoef(xVals, yVals)
    pc = r[1, 0]
    pc = r[0, 1]
    
    if math.isnan(pc):
        pc = 0
            
    tStat = pc * math.sqrt(df) / math.sqrt(1 - math.pow(pc, 2));

    if math.isnan(tStat):
        tStat = 0

    tStatAbsolute = abs(tStat);
    tDist = stats.t.cdf(tStatAbsolute, df=df)
    pVal = (1 - tDist) * 2;
    fma = yVals[-1]
    percChange = mVal / fma;
    
    if math.isnan(percChange) or math.isinf(percChange):
        percChange = 0
    
    if percChange > 0.025:
      trend = "Rising"
      
    if percChange < -0.025:
      trend = "Falling"
    
    data = {
        'calc': {   
            'M value': mVal,
            'Final seven-day moving average': fma,         
            'Pearson correlation': pc,
            't Stat': tStat,
            't Dist': tDist,
            'Degrees of freedom': df,
            'P value': pVal,
            'p_value': p_value,
            'Percent change': percChange,
            'Threshold for rising': 'greater than 0.025',
            'Threshold for falling': 'less than -0.025'
        },
      'r_value': r_value,
      'std_err': std_err,
      'key': county_key,
      'percent': percent,
      'trend': trend,
      'index': index.tolist(),
      'values': values.tolist(),
      'cases': {
          'total': 	int(total_cases),
          'per': int(round(total_cases*100000/population))
        },
    }
    return data
  
    
def county_key_name(county_name, state_code):
    key_name = county_name + " " + state_code
    key_name = key_name.lower()
    key_name = key_name.replace(' ', '-')
    return key_name
