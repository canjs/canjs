require("./funcunit");

var FuncUnit = window.FuncUnit || {};

// Removed to avoid stomping on product jQuery in case they're using a different version.
// For details, see: https://github.com/bitovi/funcunit/issues/236
//window.jQuery = jQuery; 

module.exports = FuncUnit;