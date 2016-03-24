var isFunction = require('can/util/isFunction');
var isString = require('can/util/isString');
var zid = require('can/util/zid');
var slice = Array.prototype.slice;

function proxy(fn, context) {
  var args = (2 in arguments) && slice.call(arguments, 2);
  if (isFunction(fn)) {
    var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments); };
    proxyFn._zid = zid(fn);
    return proxyFn;
  } else if (isString(context)) {
    if (args) {
      args.unshift(fn[context], fn);
      return proxy.apply(null, args);
    } else {
      return proxy(fn[context], fn);
    }
  } else {
    throw new TypeError("expected function");
  }
}

module.exports = proxy;
