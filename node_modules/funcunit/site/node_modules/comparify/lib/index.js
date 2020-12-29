var util = require('./util');

var comparify = module.exports = function(object, criteria) {
  for (var key in criteria) {
    if (criteria.hasOwnProperty(key)) {

      // Check for values
      var crit = util.getKey(criteria, key);
      var value = util.getKey(object, key);

      if (util.isObject(crit)) {
          if (!comparify(value, crit)) return false;
      } else {
          if (value !== criteria[key]) return false;
      }
    }
  }
  return true;
};
