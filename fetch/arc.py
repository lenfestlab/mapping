import requests

from dotenv import load_dotenv
load_dotenv()
import json


import os
ARC_API_TOKEN = os.getenv("ARC_API_TOKEN")

def article_url(article_id):
    url = "https://api.pmn.arcpublishing.com/content/v4/stories?website=philly-media-network"
    url = url + "&_id=" + str(article_id)
    return url

def url(size, frm, keywords):
    should = []
    for keyword in keywords:
        should.append({ "match_phrase": { "content_elements.content": keyword }})

    url = "https://api.pmn.arcpublishing.com/content/v4/search/published/?sort=created_date:desc"
    url = url + "&size=" + str(size)
    url = url + "&from=" + str(frm)
    url = url + "&website=philly-media-network"
    url = url + "&exclude_distributor_category=wires,other"
    url = url + """&body={
      \"query\": {
        \"bool\": {
          \"must_not\": [
          {\"match\": { \"taxonomy.sites._id\": \"/zzz-systest\" }}
          ],
          \"must\": [
          {\"match\": { \"type\": \"story\" }}, 
          { \"range\": { \"first_publish_date\": { \"gte\": \"2019-01-01T00:00:00\", \"lt\": \"2021-01-01T00:00:00\" }}},
          { \"bool\": {
            \"should\":""" + json.dumps(should) + """
          } }
          ]
        }
      }
    }"""
    
    return url

def request(request_url):    
    payload  = {}
    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + ARC_API_TOKEN
    }

    response = requests.request("GET", request_url, headers=headers, data = payload)

    data = response.json()
    
    return data
    