var FuncUnit = require("funcunit/browser/core");

require("funcunit/browser/adapters/");
require("funcunit/browser/open");
require("funcunit/browser/actions");
require("funcunit/browser/getters");
require("funcunit/browser/traversers");
require("funcunit/browser/queue");
require("funcunit/browser/waits");

window.FuncUnit = window.S = window.F = FuncUnit;
	
module.exports = FuncUnit;
