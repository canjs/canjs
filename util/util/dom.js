/* general lang-helper functions */
//TODO: get rid of jquery dependancy
//REMAINING DEPENDENCIES:
//	jQuery.ajax / jQuery.get
//	jQuery.cleanData
var makeArray = require('can/util/array/makeArray');
var buildFragment = require('can/util/fragment');
var data = require('can/util/data');
var nodeList = require('can/util/node-list');

//TODO: remove this behaviour along with jQuery
var tmpJqueryModAttr = require('can/util/util/temp-jquery-mod/attr');
var tmpJqueryModDomManip = require('can/util/util/temp-jquery-mod/dom-manip');
tmpJqueryModDomManip();
tmpJqueryModAttr();

var ajax = $.ajax;

var fns = ["append", "filter", "addClass", "remove", "has"].reduce(function(fns, name, i) {
			fns[name] = function (wrapped) {
				return wrapped[name].apply(wrapped, makeArray(arguments).slice(1));
			};
			return fns;
}, {});

// var append = $.fn.append;

// var filter = $.filter;

// Memory safe destruction.
var oldClean = $.cleanData;
$.cleanData = function (elems) {
	$.each(elems, function (i, elem) {
		if (elem) {
			can.trigger(elem, 'removed', [], false);
		}
	});
	oldClean(elems);
};
var cleanData = $.cleanData;

// var addClass = $.addClass;

// var $_remove = fns.remove;
// var remove = function() {
// 	this.each(function() {
// 		if (this.getElementsByTagName) {
// 			$.cleanData([this].concat(can.makeArray(this.getElementsByTagName('*'))));
// 		}
// 	});
// 	return $_remove.call(this);
// };

var get = $.get;

// var has = $.has;

module.exports = {
	ajax: ajax,
	$: nodeList,
	append: fns.append,
	filter: fns.filter,
	data: data,
	cleanData: cleanData,
	addClass: fns.addClass,
	remove: fns.remove,
	get: get,
	has: fns.has,
	buildFragment: buildFragment
};
