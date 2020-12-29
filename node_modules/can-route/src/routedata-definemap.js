var DefineMap = require("can-define/map/map");
var stringify = require("./string-coercion").stringify;

module.exports = DefineMap.extend("RouteData", { seal: false }, {
	"*": {
		type: stringify
	}
});
