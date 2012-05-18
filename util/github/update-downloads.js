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
        "can.construct.proxy.js"     : "Can Construct Proxy #{VERSION} Plugin",
        "can.observe.validations.js" : "Can Observe Validations #{VERSION} Plugin",
        "can.construct.super.js"     : "Can Construct Super #{VERSION} Plugin",
        "can.fixture.js"             : "Can Fixture #{VERSION} Plugin",
        "can.observe.attributes.js"  : "Can Observe Attributes #{VERSION} Plugin",
        "can.view.modifiers.js"      : "Can View Modifiers #{VERSION} Plugin",
        "can.control.plugin.js"      : "Can Control #{VERSION} Plugin",
        "can.observe.backup.js"      : "Can Observe #{VERSION} Backup Plugin",
        "can.control.view.js"        : "Can Control #{VERSION} View Plugin",
        "can.observe.delegate.js"    : "Can Observe #{VERSION} Delegate Plugin",
        "can.observe.setter.js"      : "Can Observe #{VERSION} Setter Plugin",
        "can.yui.js"                 : "Can YUI #{VERSION} Development",
        "can.yui.min.js"             : "Can YUI #{VERSION} Production",
        "can.mootools.js"            : "Can MooTools #{VERSION} Development",
        "can.mootools.min.js"        : "Can MooTools #{VERSION} Production",
        "can.dojo.js"                : "Can Dojo #{VERSION} Development",
        "can.dojo.min.js"            : "Can Dojo #{VERSION} Production",
        "can.jquery.js"              : "Can jQuery #{VERSION} Development",
        "can.jquery.min.js"          : "Can jQuery #{VERSION} Production",
        "can.zepto.js"               : "Can Zepto #{VERSION} Development",
        "can.zepto.min.js"           : "Can Zepto #{VERSION} Production"
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
	    dfds = _.map( descriptions, function( desc, filename ) {

		var dfd = new _.Deferred();

		desc = desc.replace("#{VERSION}", version);

		fs.readFile( path.join( distPath, filename ), function( err, buf ) {

			github.httpSend({
				"user" : "jupiterjs",
				"repo" : "canjs",
				"name" : filename,
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
