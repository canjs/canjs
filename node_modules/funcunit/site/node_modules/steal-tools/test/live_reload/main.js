var foo = require("./foo");
var liveReload = require("live-reload");

window.MODULE = {
	foo: foo
};
if(liveReload) {
	window.liveReloadFunction = liveReload.toString();
}
