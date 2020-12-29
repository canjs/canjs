var optional = require('./optional');
var Promise = global.Promise || optional('es6-promise').Promise;

var slice = Array.prototype.slice;

module.exports = function(nodeFunction) {
  return function() {
    var args = slice.call(arguments);

    return new Promise(function(resolve, reject) {
      var callback = function(error) {
        if(error) {
          return reject(error);
        }
        return resolve(arguments[1]);
      };

      nodeFunction.apply(this, args.concat([callback]));
    }.bind(this));
  };
};
