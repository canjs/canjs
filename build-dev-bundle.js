var path = require("path");
var stealTools = require("steal-tools");

stealTools.bundle({
  config: path.join(__dirname, "package.json!npm")
}, {
  filter: [ "**/*", "package.json" ],
  minify: true
}).catch(function(error) {
  console.error(error);
  process.exit(1);
});
