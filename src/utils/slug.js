import slugify from 'slugify'

slugify.extend({
  'ä': 'ae',
  'ö': 'oe',
  'ü': 'ue'
})

export default string => slugify(string.toLowerCase())
