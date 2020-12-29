var SimpleMap = require('can-simple-map');

// ### LetContext
// Instances of this are used to create a `let` variable context.

// Like Object.create, but only keeps Symbols and properties in `propertiesToKeep`
function objectCreateWithSymbolsAndSpecificProperties(obj, propertiesToKeep) {
	var newObj = {};

	// copy over all Symbols from obj
	if ("getOwnPropertySymbols" in Object) {
		Object.getOwnPropertySymbols(obj).forEach(function(key) {
			newObj[key] = obj[key];
		});
	}

	// copy over specific properties from obj (also fake Symbols properties for IE support);
	Object.getOwnPropertyNames(obj).forEach(function(key) {
		if (propertiesToKeep.indexOf(key) >= 0 || key.indexOf("@@symbol") === 0) {
			newObj[key] = obj[key];
		}
	});

	return Object.create(newObj);
}

var LetContext = SimpleMap.extend("LetContext", {});
LetContext.prototype = objectCreateWithSymbolsAndSpecificProperties(SimpleMap.prototype, [
	// SimpleMap properties
	"setup",
	"attr",
	"serialize",
	"get",
	"set",
	"log",
	// required by SimpleMap properties
	"dispatch",
	// Construct properties (not added by can-event-queue)
	"constructorExtends",
	"newInstance",
	"_inherit",
	"_defineProperty",
	"_overwrite",
	"instance",
	"extend",
	"ReturnValue",
	"setup",
	"init"
]);
LetContext.prototype.constructor = LetContext;

module.exports = LetContext;
