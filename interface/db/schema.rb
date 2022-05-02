# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2022_04_28_142647) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "admin1_us", primary_key: "ogc_fid", id: :serial, force: :cascade do |t|
    t.string "name"
    t.string "country"
    t.string "iso3166_1_alpha_3"
    t.string "state_code"
    t.string "id"
    t.geometry "wkb_geometry", limit: {:srid=>4326, :type=>"geometry"}
    t.index ["wkb_geometry"], name: "admin1_us_wkb_geometry_geom_idx", using: :gist
  end

  create_table "article_authors", force: :cascade do |t|
    t.bigint "article_id"
    t.bigint "author_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id", "author_id"], name: "index_article_authors_on_article_id_and_author_id", unique: true
    t.index ["article_id"], name: "index_article_authors_on_article_id"
    t.index ["author_id"], name: "index_article_authors_on_author_id"
  end

  create_table "article_locations", force: :cascade do |t|
    t.bigint "article_id"
    t.bigint "location_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "flagged", default: false
    t.text "comment"
    t.bigint "flag_id"
    t.index ["article_id", "location_id"], name: "index_article_locations_on_article_id_and_location_id", unique: true
    t.index ["article_id"], name: "index_article_locations_on_article_id"
    t.index ["flag_id"], name: "index_article_locations_on_flag_id"
    t.index ["location_id"], name: "index_article_locations_on_location_id"
  end

  create_table "article_sources", force: :cascade do |t|
    t.bigint "article_id"
    t.bigint "person_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id", "person_id"], name: "index_article_sources_on_article_id_and_person_id", unique: true
    t.index ["article_id"], name: "index_article_sources_on_article_id"
    t.index ["person_id"], name: "index_article_sources_on_person_id"
  end

  create_table "article_topics", force: :cascade do |t|
    t.bigint "article_id"
    t.bigint "topic_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["article_id", "topic_id"], name: "index_article_topics_on_article_id_and_topic_id", unique: true
    t.index ["article_id"], name: "index_article_topics_on_article_id"
    t.index ["topic_id"], name: "index_article_topics_on_topic_id"
  end

  create_table "articles", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "viewbox"
    t.bigint "collection_id"
    t.string "author_name"
    t.string "identifier"
    t.integer "article_locations_count", default: 0
    t.datetime "published_at"
    t.string "source_url"
    t.string "location_bias"
    t.string "thumbnail"
    t.text "comment"
    t.string "topic_name"
    t.jsonb "info", default: {}, null: false
    t.jsonb "response", default: {}, null: false
    t.boolean "evaluate", default: true
    t.string "analytics_channel"
    t.index ["collection_id"], name: "index_articles_on_collection_id"
    t.index ["identifier"], name: "index_articles_on_identifier", unique: true
  end

  create_table "authors", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "gender"
    t.string "race"
    t.jsonb "response", default: {}, null: false
    t.index ["name"], name: "index_authors_on_name", unique: true
  end

  create_table "bert_tags", force: :cascade do |t|
    t.bigint "sentence_id"
    t.string "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "location_id"
    t.string "search_term"
    t.integer "end_position"
    t.integer "start_position"
    t.string "tag_type", default: "LOC", null: false
    t.string "model_version", default: "v1", null: false
    t.index ["location_id"], name: "index_bert_tags_on_location_id"
    t.index ["model_version"], name: "index_bert_tags_on_model_version"
    t.index ["sentence_id"], name: "index_bert_tags_on_sentence_id"
  end

  create_table "census", primary_key: "ogc_fid", id: :serial, force: :cascade do |t|
    t.string "statefp"
    t.string "countyfp"
    t.string "tractce"
    t.string "geoid"
    t.string "name"
    t.string "namelsad"
    t.string "mtfcc"
    t.string "funcstat"
    t.float "aland"
    t.float "awater"
    t.string "intptlat"
    t.string "intptlon"
    t.geometry "wkb_geometry", limit: {:srid=>4326, :type=>"geometry"}
    t.index ["wkb_geometry"], name: "census_wkb_geometry_geom_idx", using: :gist
  end

  create_table "collections", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "lat", precision: 10, scale: 6
    t.decimal "lng", precision: 10, scale: 6
    t.decimal "km_radius", precision: 10, scale: 6
    t.geography "center", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.decimal "min_lat", precision: 10, scale: 6
    t.decimal "min_lng", precision: 10, scale: 6
    t.decimal "max_lat", precision: 10, scale: 6
    t.decimal "max_lng", precision: 10, scale: 6
    t.boolean "cached", default: false
  end

  create_table "county", primary_key: "ogc_fid", id: :serial, force: :cascade do |t|
    t.string "id"
    t.string "name"
    t.geometry "wkb_geometry", limit: {:srid=>4326, :type=>"geometry"}
    t.string "geoid"
    t.index ["wkb_geometry"], name: "county_wkb_geometry_geom_idx", using: :gist
  end

  create_table "county_neighborhoods", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "county_id", default: 0, null: false
    t.integer "neighborhood_id", default: 0, null: false
    t.index ["county_id"], name: "index_county_neighborhoods_on_county_id"
    t.index ["neighborhood_id"], name: "index_county_neighborhoods_on_neighborhood_id"
  end

  create_table "flags", force: :cascade do |t|
    t.string "reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
  end

  create_table "locations", force: :cascade do |t|
    t.string "name"
    t.jsonb "geojson"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "viewbox"
    t.geography "latlng", limit: {:srid=>4326, :type=>"st_point", :geographic=>true}
    t.geometry "wkb_geometry", limit: {:srid=>4326, :type=>"geometry"}
    t.bigint "zip_code_id"
    t.bigint "census_tract_id"
    t.bigint "county_id"
    t.string "formatted_address"
    t.jsonb "osm_results"
    t.jsonb "google_results"
    t.string "bias"
    t.string "geometry_type"
    t.boolean "use_osm", default: true
    t.boolean "flagged", default: false
    t.text "comment"
    t.bigint "neighborhood_id"
    t.bigint "flag_id"
    t.string "neigborhood_geoid"
    t.string "census_geoid"
    t.string "county_geoid"
    t.jsonb "article_identifiers", default: []
    t.jsonb "results", default: {}, null: false
    t.string "zipcode_geoid"
    t.index ["census_tract_id"], name: "index_locations_on_census_tract_id"
    t.index ["county_id"], name: "index_locations_on_county_id"
    t.index ["flag_id"], name: "index_locations_on_flag_id"
    t.index ["geometry_type"], name: "index_locations_on_geometry_type"
    t.index ["name", "viewbox", "bias"], name: "index_locations_on_name_and_viewbox_and_bias", unique: true
    t.index ["neighborhood_id"], name: "index_locations_on_neighborhood_id"
    t.index ["wkb_geometry"], name: "index_locations_on_wkb_geometry", using: :gist
    t.index ["zip_code_id"], name: "index_locations_on_zip_code_id"
  end

  create_table "neighborhoods", primary_key: "ogc_fid", id: :serial, force: :cascade do |t|
    t.string "name"
    t.string "listname"
    t.string "mapname"
    t.float "shape_leng"
    t.float "shape_area"
    t.string "type"
    t.integer "geoid_nh"
    t.geometry "wkb_geometry", limit: {:srid=>4326, :type=>"multi_polygon"}
    t.index ["wkb_geometry"], name: "neighborhoods_wkb_geometry_geom_idx", using: :gist
  end

  create_table "people", force: :cascade do |t|
    t.string "name"
    t.string "race"
    t.string "gender"
    t.string "title"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "sentences", force: :cascade do |t|
    t.text "content"
    t.string "identifier"
    t.bigint "article_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "bert_tags_count", default: 0
    t.jsonb "response", default: {}, null: false
    t.integer "position", default: 0
    t.integer "start_char", default: 0
    t.integer "end_char", default: 0
    t.jsonb "spacy_response", default: {}, null: false
    t.jsonb "ner_response", default: {}, null: false
    t.index ["article_id", "content", "position"], name: "index_sentences_on_article_id_and_content_and_position", unique: true
    t.index ["article_id"], name: "index_sentences_on_article_id"
  end

  create_table "state_counties", force: :cascade do |t|
    t.bigint "county_id"
    t.bigint "state_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["county_id"], name: "index_state_counties_on_county_id", unique: true
    t.index ["state_id", "county_id"], name: "index_state_counties_on_state_id_and_county_id", unique: true
    t.index ["state_id"], name: "index_state_counties_on_state_id"
  end

  create_table "topics", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_topics_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "zcta5", primary_key: "ogc_fid", id: :serial, force: :cascade do |t|
    t.string "zcta5ce10"
    t.string "geoid10"
    t.string "classfp10"
    t.string "mtfcc10"
    t.string "funcstat10"
    t.float "aland10"
    t.float "awater10"
    t.string "intptlat10"
    t.string "intptlon10"
    t.geometry "wkb_geometry", limit: {:srid=>4326, :type=>"geometry"}
    t.index ["wkb_geometry"], name: "zcta5_wkb_geometry_geom_idx", using: :gist
  end

  add_foreign_key "article_authors", "articles"
  add_foreign_key "article_authors", "authors"
  add_foreign_key "article_locations", "articles"
  add_foreign_key "article_locations", "flags"
  add_foreign_key "article_locations", "locations"
  add_foreign_key "article_sources", "articles"
  add_foreign_key "article_sources", "people"
  add_foreign_key "article_topics", "articles"
  add_foreign_key "article_topics", "topics"
  add_foreign_key "bert_tags", "locations"
  add_foreign_key "bert_tags", "sentences"
  add_foreign_key "locations", "flags"
  add_foreign_key "sentences", "articles"
end
