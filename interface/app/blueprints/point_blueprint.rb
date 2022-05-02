class PointBlueprint < Blueprinter::Base
  identifier :id
    
  field :properties do |location, options|
    {
      articles: location.article_identifiers,
      "GEOID-NH": location.neigborhood_geoid,
      "GEOID-CT": location.census_geoid,
      "GEOID-CO": location.county_geoid      
    }
  end
  
  field :type do |location, options|
      "Feature"
  end

  field :geometry do |location, options|
      location.results['geojson']
  end
  
end
