var path            = require("path"),
    fs              = require("fs"),
    spawn           = require("child_process").spawn,

    // Third party modules
    program         = require("commander"),
    GitHubApi       = require("github"),
    _               = require("underscore"),
    s3p             = require("./s3-post.js"),

    // Get the current version of CanJS
    version         = fs.readFileSync( path.join( __dirname, "../version" )).toString("utf8").trim(),

    // Describe all the files we'll be uploading to Github
    descriptions    = {
        "can.construct.proxy.js"     : {
			description : "Can Construct Proxy #{VERSION} Plugin",
			filename    : "can.construct.proxy-#{VERSION}.js"
		},
        "can.observe.validations.js" : {
			description : "Can Observe Validations #{VERSION} Plugin",
			filename    : "can.observe.validations-#{VERSION}.js"
		},
        "can.construct.super.js"     : {
			description : "Can Construct Super #{VERSION} Plugin",
			filename    : "can.construct.super-#{VERSION}.js"
		},
        "can.fixture.js"             : {
			description : "Can Fixture #{VERSION} Plugin",
			filename    : "can.fixture-#{VERSION}.js"
		},
        "can.observe.attributes.js"  : {
			description : "Can Observe Attributes #{VERSION} Plugin",
			filename    : "can.observe.attributes-#{VERSION}.js"
		},
        "can.view.modifiers.js"      : {
			description : "Can View Modifiers #{VERSION} Plugin",
			filename    : "can.view.modifiers-#{VERSION}.js"
		},
        "can.control.plugin.js"      : {
			description : "Can Control #{VERSION} Plugin",
			filename    : "can.control.plugin-#{VERSION}.js"
		},
        "can.observe.backup.js"      : {
			description : "Can Observe #{VERSION} Backup Plugin",
			filename    : "can.observe.backup-#{VERSION}.js"
		},
        "can.control.view.js"        : {
			description : "Can Control #{VERSION} View Plugin",
			filename    : "can.control.view-#{VERSION}.js"
		},
        "can.observe.delegate.js"    : {
			description : "Can Observe #{VERSION} Delegate Plugin",
			filename    : "can.observe.delegate-#{VERSION}.js"
		},
        "can.observe.setter.js"      : {
			description : "Can Observe #{VERSION} Setter Plugin",
			filename    : "can.observe.setter-#{VERSION}.js"
		},
        "can.yui.js"                 : {
			description : "Can YUI #{VERSION} Development",
			filename    : "can.yui-#{VERSION}.js"
		},
        "can.mootools.js"            : {
			description : "Can MooTools #{VERSION} Development",
			filename    : "can.mootools-#{VERSION}.js"
		},
        "can.dojo.js"                : {
			description : "Can Dojo #{VERSION} Development",
			filename    : "can.dojo-#{VERSION}.js"
		},
        "can.jquery.js"              : {
			description : "Can jQuery #{VERSION} Development",
			filename    : "can.jquery-#{VERSION}.js"
		},
        "can.zepto.js"               : {
			description : "Can Zepto #{VERSION} Development",
			filename    : "can.zepto-#{VERSION}.js"
		},

        "can.yui.min.js"             : {
			description : "Can YUI #{VERSION} Production",
			filename    : "can.yui-#{VERSION}.min.js"
		},
        "can.mootools.min.js"        : {
			description : "Can MooTools #{VERSION} Production",
			filename    : "can.mootools-#{VERSION}.min.js"
		},
        "can.dojo.min.js"            : {
			description : "Can Dojo #{VERSION} Production",
			filename    : "can.dojo-#{VERSION}.min.js"
		},
        "can.jquery.min.js"          : {
			description : "Can jQuery #{VERSION} Production",
			filename    : "can.jquery-#{VERSION}.min.js"
		},
        "can.zepto.min.js"           : {
			description : "Can Zepto #{VERSION} Production",
			filename    : "can.zepto-#{VERSION}.min.js"
		}
    },

    // Figure out some paths
    rhinoPath       = path.join(__dirname, "../../.."),
    distPath        = path.join(__dirname, "../../dist/edge"),

    // Github client
    github          = new GitHubApi({
        version: "3.0.0"
    }),
	canJSRemote = "git@github.com:jupiterjs/canjs.git",

    // Timeouts
	stealTimeout,

    // For Github credentials
    username,
    password,

    // For steal build process
    pluginify;

// Get deferreds
_.mixin( require("underscore.deferred") );

// Update canjs.us dist
function updateDist() {
	console.log("Copying built files to gh-pages.");

	var clone = spawn("git", [ "clone", canJSRemote ], {
		cwd : __dirname
	}), dfd = new _.Deferred();

	clone.on("exit", function() {

		var clonePath = path.join( __dirname, "canjs" ),
		checkout = spawn("git", [ "checkout", "gh-pages"], {
				cwd : clonePath
		});

		checkout.on("exit", function() {
			var cloneReleasePath = path.join( clonePath, "release" ),
			    latestPath = path.join( cloneReleasePath, "latest" ),
			    versionPath = path.join( cloneReleasePath, version );

			// Make sure directories exist
			[ cloneReleasePath, versionPath, latestPath ].forEach( function( dir ) {
				if ( ! path.existsSync( dir )) {
					fs.mkdirSync( dir );
				}
			});

			fs.readdir( distPath, function( err, files ) {
				var dfds = files.map(function( file ) {
					var dfd = new _.Deferred(),
						inPath = path.join( distPath, file ),
					    outPath = path.join( versionPath, file ),
						latestOutPath = path.join( latestPath, file ),
						inStream = fs.createReadStream( inPath );

					inStream.pipe( fs.createWriteStream( outPath ));
					inStream.pipe( fs.createWriteStream( latestOutPath ));

					inStream.on("end", function() {
						dfd.resolve();
					});

					return dfd.promise();

				});

				_.when.apply( _, dfds ).done(function() {
					console.log("Finished copying files. Cleaning up...")
					var add = spawn("git", ["add", "release/*"], {
						cwd : clonePath
					});

					add.on("exit", function() {
						var commit = spawn("git", ["commit", "-m", "Generated release files for " + version ], {
							cwd : clonePath
						});

						commit.on("exit", function() {
							var push = spawn("git", ["push", "origin", "gh-pages"], {
								cwd : clonePath
							});

							push.on("exit", function() {

								var remove = spawn("rm", ["-rf", "canjs"], {
									cwd : __dirname
								});
								console.log("Done!")
							
							});
						});
					});
				});
			});
		});

	});

	return dfd.promise();
}

// Upload files to the Github downloads page
function uploadFiles() {

	var dfd = new _.Deferred(),
	    dfds = _.map( descriptions, function( parts, filename ) {

		var dfd = new _.Deferred(),
			desc = parts.description.replace("#{VERSION}", version),
			name = parts.filename.replace("#{VERSION}", version);

		fs.readFile( path.join( distPath, filename ), function( err, buf ) {

			github.httpSend({
				"user" : "jupiterjs",
				"repo" : "canjs",
				"name" : name,
				"size" : buf.length,
				"description" : desc,
				"content_type" : "text/javascript"
			}, {
				"url": "/repos/:user/:repo/downloads",
				"method": "POST",
				"params": {
					"$user": null,
					"$repo": null,
					"$name": null,
					"$size": null,
					"description": null,
					"$content_type": null
				}
			}, function( err, socket ) {

				var data = JSON.parse( socket.data );


				s3p.postToS3({
					key : data.path,
					acl : data.acl,
					success_action_status : "201",
					Filename : data.name,
					AWSAccessKeyId : data.accesskeyid,
					policy64 : data.policy,
					signature64 : data.signature,
					contentType : data.mime_type,
					data : buf,
					bucket: "github"
				}, function( e ) {
					if ( e ) {
						console.log( e );
					}
					dfd.resolve();
				})

			});

		});
		
		return dfd.promise();
	});

	_.when.apply( _, dfds ).done(dfd.resolve.bind( dfd ));

	return dfd.promise();
}

function stealBuild() {

	var dfd = new _.Deferred();

	// Run Steal build script
	pluginify = spawn( "js", ["can/util/make.js"], {
		cwd: rhinoPath
	});

	pluginify.on("exit", dfd.resolve.bind( dfd ));
	
	return dfd.promise();
}

// Clean up on process exit
process.on("exit", function() {
	process.stdout.write("\n")
})

// Get Github credentials
function getCredentials() {

	var dfd = new _.Deferred();

	program.prompt("Github Username: ", function( name ) {
		username = name;

		program.password("Github Password: ", "*", function( pass ) {
			var timeout;
			password = pass;
			process.stdin.pause();

			github.authenticate({
				type: "basic",
				username: username,
				password: password
			});

			process.stdout.write("Building CanJS...")
			stealTimeout = setInterval(function() {
				process.stdout.write(".")
			}, 1000 )
			dfd.resolve();
		})

	});

	return dfd.promise();
}

_.when( stealBuild(), getCredentials() ).done(function( args ) {

	var code = args.shift();
	
	if ( stealTimeout ) {
		clearTimeout( stealTimeout );
		process.stdout.write(" Done!\n")
	}

	if ( code != 0 ) {
		console.log("Steal build process failed.")
	} else {
		_.when( uploadFiles(), updateDist() ).done(function() {
		});
	}
});
