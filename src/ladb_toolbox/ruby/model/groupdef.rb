require 'securerandom'

class GroupDef

  attr_accessor :material_name, :material_type, :part_count, :raw_thickness, :raw_thickness_available
  attr_reader :id, :part_defs

  def initialize
    @id = SecureRandom.uuid
    @material_name = ''
    @material_type = MaterialAttributes::TYPE_UNKNOW
    @raw_thickness = 0
    @part_count = 0
    @part_defs = {}
  end

  def set_part_def(key, piece_def)
    @part_defs[key] = piece_def
  end

  def get_part_def(key)
    if @part_defs.has_key? key
      return @part_defs[key]
    end
    nil
  end

end