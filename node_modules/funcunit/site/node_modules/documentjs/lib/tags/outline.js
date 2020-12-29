/**
 * @constructor documentjs.tags.outline @outline
 * @parent documentjs.tags
 * 
 * @description 
 * 
 * Controls the outline behavior.
 * 
 * @signature `@outline DEPTH TAG`
 * 
 * Controls the outline's depth and type.
 * 
 * @param {Number} [DEPTH=1] The number of headers below and including h2. For example,
 * `2` will include `h2` and `h3` elements.
 * 
 * @param {String} [TAG="ul"] Make the list an ordered list. 
 * 
 * @body
 * 
 */
module.exports = {
		add: function (line, curData, scope, docMap) {
			var m = line.match(/@outline\s+(\d+)(?:\s+(ol|ul))?/);
			if(m) {
				if(!this.outline) {
					this.outline = {};
				}
				if(m[1]) {
					this.outline.depth = +m[1];
				}
				if(m[2]) {
					this.outline.tag = m[2];
				}
			} else {
				console.warn("WARN!: did not match @outline for ",line);
			}
		}
	};