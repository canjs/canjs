var pluginifierBuilder = require("../lib/build/export");

module.exports = function(grunt){

	var task =  function(){
		var done = this.async();
		var options = this.data;
		// make sure things look right
		["system","outputs"].forEach(function(name){
			if(!options[name]) {
				grunt.fail.warn("steal-export needs a "+name+" property.");
			}
		});
		
		pluginifierBuilder(options, 
			grunt.config('meta.steal.export-helpers'),
			grunt.config('meta.steal.modules') ).then(function(){
			done();
		}, done);
	};

	grunt.registerMultiTask("steal-export", "Create a 'plugin' version of your project which is not dependent on Steal.", task);
};
