var FuncUnit = require("funcunit/browser/core");

var ok = function(expr, msg) {
  if(!expr) throw new Error(msg);
};

module.exports = function(){
  FuncUnit.timeout = 1900;

  return {
    pauseTest: function() {},
    resumeTest: function() {},

    assertOK: function(assertion, message) {
      ok(assertion, message);
    },

    equiv: function(expected, actual) {
      //should this be === for tighter asserts?
      return expected == actual;
    }
  };
};
