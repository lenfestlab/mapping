# Mapping Project Mono-Repo
## Folders

### coronavirus
#### Heroku App: coronavirus-lenfestlab

  * The coronavirus folder contains a project to categorize **Local Covid-19 Coverage** powered by our model output.
  * http://coronavirus-lenfestlab.herokuapp.com/?after=2021-03-02&before=2021-03-11 

### coverage
#### Heroku App: coverage-analysis

  * The coverage folder contains our last and fastest general map that visualizes locations mentioned in the articles in a collection.
  * http://coverage-analysis.herokuapp.com/collections/13
  * It also powers the map component in http://mapping-ui.herokuapp.com via the following url.
  * https://coverage-analysis.herokuapp.com/visualize/zctaData/19107?after=2021/01/01&before=2022/03/15

### fetch

  * The fetch folder contains old scripts we used to fetch articles from ARC and convert them into csv format.

### interface
#### Heroku App: lenfest-mapping

  * The interface folder contains the rails interface that allows users to submit articles and get and store api results
  * http://lenfest-mapping.herokuapp.com

### model
#### Digital Ocean Droplet: mapping (managed by the Brown Institute)

  * The model folder contains the python flask api that deploys the NLP models.
  * Spacy entities: POST http://165.227.213.110:41686/entities { "content": "The sample sentence to analyze." }
  * New model: POST http://165.227.213.110:41686/ner { "content": "The sample sentence to analyze." }
  * Old model: POST http://165.227.213.110:41686/ { "content": "The sample sentence to analyze." }

### web
#### Heroku App: brown-mapping

  * The web folder contains old websites that we no longer use.
  * https://brown-mapping.herokuapp.com/coronavirus/?after=2020/10/27&before=2021/10/28 (Still seems to be working)
  * https://brown-mapping.herokuapp.com/kpcc/ (Deprecated)
  * http://brown-mapping.herokuapp.com/photo-assignments/ (Deprecated - Collection 9)

## Git Information

```
git remote -v

coronavirus	https://git.heroku.com/coronavirus-lenfestlab.git (fetch)
coronavirus	https://git.heroku.com/coronavirus-lenfestlab.git (push)
coverage	https://git.heroku.com/coverage-analysis.git (fetch)
coverage	https://git.heroku.com/coverage-analysis.git (push)
geospatial	dokku@165.227.213.110:geospatial (fetch)
geospatial	dokku@165.227.213.110:geospatial (push)
interface	https://git.heroku.com/lenfest-mapping.git (fetch)
interface	https://git.heroku.com/lenfest-mapping.git (push)
origin	git@github.com:lenfestlab/mapping.git (fetch)
origin	git@github.com:lenfestlab/mapping.git (push)
web	https://git.heroku.com/brown-mapping.git (fetch)
web	https://git.heroku.com/brown-mapping.git (push)

```
