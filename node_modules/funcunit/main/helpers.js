const fs = require("fs");

module.exports = function(docMap, options, getCurrent){
  return {
    "getVersion" : function(){
      const package = fs.readFileSync(process.cwd() + '/package.json', 'utf8');
      return JSON.parse(package).version;
    }
  }
};
