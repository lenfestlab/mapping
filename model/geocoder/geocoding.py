#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
from datetime import datetime
import requests
import json
from tqdm import tqdm
import configparser
import sys
from difflib import SequenceMatcher
import re
import os
import numpy as np

# Global metadata read from config file
google_key = os.getenv("GOOGLE_API_KEY")
google_center = os.getenv("GOOGLE_API_LOCATION_CENTER")
google_radius = os.getenv("GOOGLE_API_SEARCH_RADIUS")

# In[2]:

# remove lower cased articles
def remove_lower_case_loc(loc_list):
    clean_locations = []
    for i in loc_list:
        if (not i[0].isnumeric()) and (i[0].islower()):
            pass
        else:
            clean_locations.append(i)
    return list(set(clean_locations))


# In[3]:
def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def format_location(articles):
    articles = articles.groupby('id')['bert_tags'].apply(np.hstack).to_frame().reset_index()
    # extracted_locations = extracted_locations.apply(lambda x: remove_lower_case_loc(x))
    return articles


# In[4]:


def query_google_api(query):
    # enter your api key here
    global google_request_num
    google_request_num +=1
    
    #Parameters for the query
    api_key = google_key
    location_center = google_center
    search_radius = google_radius #in metres

    # url variable store url 
    url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?'
    url = url+'query='+query
    url = url+'&key='+api_key
    url = url+'&location='+location_center
    url = url+'&radius='+search_radius
    print(url)
    
    # return response object 
    r = requests.get(url) 

    # json method of response object convert 
    #  json format data into python format data 
    x = r.json() 
    keys = ['formatted_address', 'geometry', 'types', 'name']
    dict = {'queried_for': query}
    if 'results' in x and len(x['results'])>0:
        for k in keys:
            if k in x['results'][0]:
                dict[k] = x['results'][0][k]
                
    #basic fields
    dict = {'queried_for': query, 'formatted_address':'', 'type':[], 'lat':'', 'lon':'','boundingbox':[], 'geojson':{}}
    
    if 'results' in x and len(x['results'])>0:
        output = x['results'][0]
        if 'formatted_address' in output:
            dict['formatted_address'] = output['formatted_address']
        if 'types' in output:
            dict['type'] = output['types']
        if 'geometry' in output:
            geo = output['geometry']
            lat = geo['location']['lat']
            lon = geo['location']['lng']
            nlat = geo['viewport']['northeast']['lat']
            nlon = geo['viewport']['northeast']['lng']
            slat = geo['viewport']['southwest']['lat']
            slon = geo['viewport']['southwest']['lng']
            dict['lat'] = lat
            dict['lon'] = lon
            dict['boundingbox'] =[nlat, slat, nlon, slon]
        #print(output)
    return dict


# In[5]:


def query_osm_api(query, viewbox=None):
    global osm_request_num
    osm_request_num +=1
    url = '''https://nominatim.openstreetmap.org/search.php?q='''+query+'''&polygon_geojson=1&format=json'''
    if viewbox:
        url = url+'''&viewbox='''+viewbox
    print(url)
    r = requests.get(url)
    x = r.json()
    if len(x)==0:
        return None
    x = x[0]
    #basic fields
    dict = {'queried_for': query, 'boundingbox':[], 'geojson':{}}
    dict['formatted_address'] = x['display_name']
    dict['type'] = [x['type']]
    
    #lat lon info
    dict['lat'] = x['lat']
    dict['lon'] = x['lon']
    if 'boundingbox' in x:
        dict['boundingbox'] = x['boundingbox']
    if 'geojson' in x:
        dict['geojson'] = x['geojson']
    
    return dict


# In[7]:


# global variables
google_request_num = 0
osm_request_num = 0
counties_list = None
county_data = None
# In[8]:

def get_county(query, threshold):
    global counties_list, county_data
    if counties_list is None:
        with open('geocoder/counties.json') as json_file:
            county_data = json.load(json_file)

        counties_list = []
        for i in county_data['features']:
            l1 = re.sub(r'[^\w\s]','',i['properties']['NAME']).lower()
            l1 = re.sub(r' ','',l1)
            
            l2 = re.sub(r'[^\w\s]','',i['properties']['NAMELSAD']).lower()
            l2 = re.sub(r' ','',l2)
            counties_list.append(set([l1, l2]))
            
    
    location = re.sub(r'[^\w\s]','',query)
    location = location.lower()
    location = re.sub(r' ','',location)

    max_similarity = float("-inf")
    max_index = None
    for i,l in enumerate(counties_list):
        for ls in l:
            s = similar(ls, location)
            if s>max_similarity:
                max_similarity = s
                max_index = i
                
    if max_similarity >= threshold:
        row = county_data['features'][max_index]
        dict = {'queried_for': location, 'formatted_address':row['properties']['NAME'], 'type':['county'], 'lat':float(row['properties']['INTPTLAT']), 'lon':float(row['properties']['INTPTLON']),'boundingbox':[], 'geojson':row['geometry']}
        
        return True, dict
    
    return False, None


def get_location(nlp, query, viewbox):
    result = None
    
    res = get_county(query, 0.90)
    if res[0] == True:
        result = res[1]
    else:
        print(query)
        doc = nlp(str(query))
        ent_list = []
        for ent in doc.ents:
            ent_list.append(ent.label_)

        if len(set(ent_list))==1 and ent_list[0]=='GPE':
            result = query_osm_api(query, viewbox)
            if not result:
                result = query_osm_api(query)
                
        if not result:
            result = query_google_api(query)
            
    return result


def get_geocode(nlp, query_list, cache, cache_keys):
    bad_loc = ['U . S .','U . S', 'U', 'S', 'U.S.', 'US', 'United States']
    locations = []
    not_found_locations = []
    for query in query_list:
        if query not in bad_loc:
            result = None
            if query in cache_keys:
                result = cache[query]
            
            res = get_county(query, 0.90)
            if res[0] == True:
                result = res[1]
            else:
                print(query)
                doc = nlp(str(query))
                ent_list = []
                for ent in doc.ents:
                    ent_list.append(ent.label_)

                if len(set(ent_list))==1 and ent_list[0]=='GPE':
                    result = query_osm_api(query, osm_viewbox)
                    if not result:
                        result = query_osm_api(query)
                else:
                    result = query_google_api(query)
            if result:
                cache[query]=result
                cache_keys.append(query)
                locations.append(query) 
            else:
                not_found_locations.append(query)
    return locations, not_found_locations, cache, cache_keys


# In[9]:

def articles_metadata(articles_sent_df_tagged):
    articles_loc = format_location(articles_sent_df_tagged)
    return articles_loc

def augment_geocode(nlp, articles_loc):
    global google_request_num, osm_request_num
    # cache = {'Philly':query_osm_api('Philadelphia')}
    # cache_keys = ['Philly']

    cache = {}
    cache_keys = []

    all_not_found_locations = []
    # with columns as ['id', 'extracted_locations']
        
    # geocode for the locations in each article
    filtered_locations =[]
    for i, row in tqdm(articles_loc.iterrows()):
        x, not_found_list, cache_t, cache_keys_t = get_geocode(nlp, row['bert_tags'], cache, cache_keys)
        cache.update(cache_t)
        cache_keys = cache_keys + cache_keys_t
        
        all_not_found_locations = all_not_found_locations + not_found_list
        filtered_locations.append(x)
    print("Total number of google geocode queires: ", google_request_num) 
    print("Total number of osm geocode queires: ", osm_request_num)
    
    articles_loc['extracted_locations'] = filtered_locations
    
    return articles_loc, cache, all_not_found_locations

