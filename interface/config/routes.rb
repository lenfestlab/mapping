Rails.application.routes.draw do
  devise_for :users
  resources :sentences, only: [:show]
  resources :bert_tags, only: [:edit, :update]
  resources :articles
  resources :locations  
  resources :states  
  resources :counties  
  resources :topics  
  resources :neighborhoods  
  resources :zip_codes  
  resources :article_locations  
  resources :collections
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  
  require 'sidekiq/web'
  mount Sidekiq::Web, at: '/sidekiq'
  
  root to: 'articles#index'
  
  post '/collections(/:id)/import', controller: :collections, action: :import, as: 'import_collections'
  get '/collections(/:id)/points', controller: :collections, action: :points
  get '/collections(/:id)/polys', controller: :collections, action: :polys
  get '/collections(/:id)/map', controller: :collections, action: :map
  get '/collections(/:id)/locations', controller: :collections, action: :locations
  get '/collections(/:id)/locations(/:location_id)', controller: :collections, action: :location
  get '/collections(/:id)/zip_codes', controller: :collections, action: :zip_codes
  get '/collections(/:id)/authors', controller: :collections, action: :authors
  get '/collections(/:id)/topics', controller: :collections, action: :topics
  get '/collections(/:id)/census_tracts', controller: :collections, action: :census_tracts
  get '/collections(/:id)/counties', controller: :collections, action: :counties
  get '/collections(/:id)/neighborhoods', controller: :collections, action: :neighborhoods
  get '/collections(/:id)/featured', controller: :collections, action: :featured
  get '/collections(/:id)/articles', controller: :collections, action: :articles
  get '/collections(/:id)/tasks', controller: :collections, action: :tasks
  get '/collections(/:id)/info', controller: :collections, action: :info
  get '/collections(/:id)/simple_articles', controller: :collections, action: :simple_articles
  get '/collections(/:id)/article_locations', controller: :collections, action: :article_locations
  get '/collections(/:id)/featured_articles', controller: :collections, action: :featured_articles
  get '/collections(/:id)/featured_article_locations', controller: :collections, action: :featured_article_locations
  
end
