require("./foo");
var other = require("other");

window.MODULE = {
	other: other,
	foo: window.foo.bar
};
