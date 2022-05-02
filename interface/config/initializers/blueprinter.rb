# config/initializers/blueprinter.rb
require 'oj'
Blueprinter.configure do |config|
  config.generator = Oj
end
