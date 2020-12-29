
// In IE the description property of an error is visibel
if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (Object.prototype.toString.call(obj) === '[object Error]') {
      array = array.filter(function (name) {
        return name !== 'description' && name !== 'number';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, Object.keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, Object.getOwnPropertyNames(object));
  };
} else {
  exports.keys = Object.keys;
  exports.getOwnPropertyNames = Object.getOwnPropertyNames;
}
