import "main.css!";
import "other.css!";

"format cjs";

var global = require("global");

var thisObjectHasABigName = {
	foo: "bar"
};

module.exports = thisObjectHasABigName;
