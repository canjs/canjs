var stealTools = require('steal-tools'),
	rmdir = require('rimraf');


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
				console.log("built");
				//done();
				/*open("test/build_types/prod.html", function(browser, close){
			
					find(browser,"STYLE_CONTENT", function(styleContent){
						assert(styleContent.indexOf("#test-element")>=0, "have correct style info");
						close();
					}, close);
					
				}, done);*/
				
			}).catch(function(e){
				done(e);
			});
		});
//});
