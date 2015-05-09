var Map = require("can/map/");
require("can/map/define/");

module.exports = Map.extend({
	define: {
		choice: {
			type: "string"
		},
		isCorrect:  {
			get: function(){
				return this.attr("choice") === "bride-of-frankenstein";
			}
		}
	}
});
