var System = require("./loader");

System.transpiler = "traceur";
try {
	System.paths.traceur = "../../node_modules/traceur/bin/traceur.js";
}
catch(e) {
	console.error("Could not load traceur\n", e);
}

try {
	System.paths.babel = "../../node_modules/babel-standalone/babel.js";
}
catch(e) {
	console.error("Could not load babel\n", e);
}

module.exports = {
  Loader: global.LoaderPolyfill,
  System: System
};
