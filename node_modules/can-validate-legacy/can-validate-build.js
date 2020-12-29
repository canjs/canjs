"use strict";
var canValidate = require("can-validate-legacy");
var validate = require("can-validate-legacy/map/validate/");
var validateJsShim = require("can-validate-legacy/shims/validatejs");

module.exports = {
	"can-validate": canValidate,
	"map": {
		validate: validate
	},
	"shims": {
		"validatejs.shim": validateJsShim
	}
};
