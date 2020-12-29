// Stolen from https://github.com/mikeal/request/blob/master/lib/optional.js
// Apache licensed

module.exports = function(moduleName) {
  try {
    return module.parent.require(moduleName)
  } catch (e) {
    // This could mean that we are in a browser context.
    // Add another try catch like it used to be, for backwards compability
    // and browserify reasons.
    try {
      return require(moduleName)
    }
    catch (e) {}
  }
};
