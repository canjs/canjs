var Handlebars = require("handlebars");

var fsx = require('../../../fs_extras'),
	path = require('path');
	
var	Q = require('q');

// this should be called 
module.exports = function(dir, OtherHandlebars){
	
	return fsx.readdir(dir).then(function(files){
		
		var promises = files.filter(function(filename){
			return filename.indexOf(".mustache") >= 0;
		}).map(function(filename){
			return  fsx.readFile(path.join(dir, filename)).then(function(template){
				(OtherHandlebars || Handlebars).registerPartial(filename, template.toString());
			});
		});
		
		return Q.all(promises)
		
	});
	
	
};
