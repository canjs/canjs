var path = require("path");
var stealTools = require("steal-tools");

var promise = stealTools.bundle({
  config: path.join(__dirname, "package.json!npm")
}, {
  filter: [ "**/*", "package.json" ],
  minify: true
});
