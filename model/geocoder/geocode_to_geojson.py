import pandas as pd
import numpy as np
import json
from tqdm import tqdm


def to_geojson(cache, df):
    
    '''
    input: list of geocoded locations, metadata on articles
    output: GeoJSON - OSM, Google and DF
    '''
    
    geojson_osm = {"type": "FeatureCollection", "features": []}
    geojson_google = {"type": "FeatureCollection", "features": []}
    
    for h, i in tqdm(enumerate(cache.values())):
        if i['formatted_address'] != "" and not i['queried_for'].isdigit():
            dict = {}
            dict['type'] = 'Feature'
            dict['id'] = i['queried_for']
            dict['properties'] = {}
            dict['properties']['formatted_address'] = i['formatted_address']
            dict['properties']['category'] = i['type']
            # dict['properties']['articles'] = list(df[df['extracted_locations'] == i['queried_for']].drop_duplicates().id)
            dict['geometry'] = {}
            if i['geojson'] == {}:
                dict['geometry']['type'] = 'Point'
                dict['geometry']['coordinates'] = [float(i['lon']), float(i['lat'])]
                geojson_google['features'].append(dict)
            else:
                dict['geometry'] = i['geojson']
                geojson_osm['features'].append(dict)
        else:
            continue
                        
    return geojson_google, geojson_osm