var clone = require("lodash/clone");
var findLineColumn = require("find-line-column");
var makeTagRegEx = require("../build/clean").makeTagRegEx;
var SourceMapConsumer = require("bitovi-source-map").SourceMapConsumer;
var transformActiveSource = require("../node/transform_active_source");

var clean = function(node, options){
	var removeTags = (options.removeTags || []).slice(0);

	if(!removeTags.length) {
		removeTags.push("steal-remove");
		removeTags.push(/steal.dev.(?:log|warn|assert)\(.*\);?/g);
	}

	if(!node.load.metadata.buildType || node.load.metadata.buildType === "js") {
		transformActiveSource(node, "clean-true", function(node, source){
			source = clone(source);
			var empty = makeUpdater(source);
			removeTags.forEach(function(tag) {
				if (tag instanceof RegExp) {
					source.code = source.code.replace(tag, empty);
				} else {
					source.code = source.code.replace(makeTagRegEx(tag), empty);
				}
			});
			return source;
		});
	}
};

module.exports = clean;

var REGEX_NEWLINE = /(\r?\n)/g;
/**
 * @function makeUpdater
 * @description Creates function that acts as a callback to String.prototype.replace.
 * Calculates the offset caused by the removal of a match and applies new mappings to
 * the source map.
 * @return {Function}
 */
function makeUpdater(source) {
	var map = source.map;

	if(!map) {
		return function() { return ""; };
	}

	function offsetFor(string){
		var parts = string.split(REGEX_NEWLINE);
		return {
			lines: 0 - (parts.length - 1),
			columns: 0 - parts[parts.length - 1].length
		};
	}

	var consumer;
	return function(match) {
		var string = arguments[arguments.length - 1];
		var offset = arguments[arguments.length - 2];
		consumer = consumer || new SourceMapConsumer(map.toJSON());

		var position = findLineColumn(string, offset);
		offset = offsetFor(match);

		consumer.eachMapping(function(mapping) {
			// Skip mappings that precede the change.
			if(mapping.generatedLine < position.line ||
			   (mapping.generatedLine === position.line &&
				mapping.generatedColumn < position.column)) {
				return;
			}

			var offsetColumns = mapping.generatedColumn > Math.abs(offset.columns) ?
				offset.columns : 0;
			if(offset.lines > 0 && offsetColumns > 0) {
				map.addMapping({
					generated: {
						line: offset.lines + mapping.generatedLine,
						column: offsetColumns + mapping.generatedColumn
					},
					original: {
						line: mapping.originalLine,
						column: mapping.originalColumn
					},
					source: mapping.source
				});
			}
		});

		return "";
	};
}
