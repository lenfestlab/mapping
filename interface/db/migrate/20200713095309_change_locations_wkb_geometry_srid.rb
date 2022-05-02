class ChangeLocationsWkbGeometrySrid < ActiveRecord::Migration[5.2]
  def self.up
    srid = 4326
    change_srid('locations', srid)
  end

  def self.down
    srid = 0
    change_srid('locations', srid)
  end

  private

  def self.change_srid(table, srid = -1)
    execute "select UpdateGeometrySRID('#{table}', 'wkb_geometry', #{srid})"
    execute "select ST_SetSRID(wkb_geometry, #{srid}) from #{table}"
  end
end
