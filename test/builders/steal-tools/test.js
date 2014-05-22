var stealTools = require('steal-tools'),
	rmdir = require('rimraf'),
	zombieHelp = require('../zombie_help');

var done = function(e){
	if(e){
		console.log(e, e.stack)
	}
};


//it("works with css buildType", function(done){
		
		rmdir(__dirname+"/bundles", function(error){
			
			if(error){
				done(error)
			}
			// build the project that 
			// uses a plugin
			stealTools.build({
				config: __dirname+"/config.js",
				main: "app"
			}).then(function(data){
				console.log("built")
				
			}).catch(function(e){
				done(e);
			});
		});
//});
