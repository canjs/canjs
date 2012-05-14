var path            = require("path"),
	program         = require("commander"),
	GitHubApi       = require("github"),
	github          = new GitHubApi({
		version: "3.0.0"
	}),
	qs              = require("querystring"),
	fs              = require("fs"),
	https           = require("https"),
	s3p             = require("./s3-post.js"),
	rhinoPath       = path.join(__dirname, "../../.."),
	distPath        = path.join(__dirname, "../../dist/edge"),
	spawn           = require("child_process").spawn,
	_               = require("underscore"),
	version         = fs.readFileSync( path.join( __dirname, "../version" )),
	descriptions    = {
		"can.construct.proxy.js"     : "Can Construct Proxy Plugin",
		"can.observe.validations.js" : "Can Observe Validations Plugin",
		"can.construct.super.js"     : "Can Construct Super Plugin",
		"can.fixture.js"             : "Can Fixture Plugin",
		"can.observe.attributes.js"  : "Can Observe Attributes Plugin",
		"can.view.modifiers.js"      : "Can View Modifiers Plugin",
		"can.control.plugin.js"      : "Can Control Plugin",
		"can.observe.backup.js"      : "Can Observe Backup Plugin",
		"can.control.view.js"        : "Can Control View Plugin",
		"can.observe.delegate.js"    : "Can Observe Delegate Plugin",
		"can.observe.setter.js"      : "Can Observe Setter Plugin",
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
	username,
	password,
	pluginify;

function uploadFiles() {

	_.each( descriptions, function( desc, filename ) {

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
				})

			});

		});
		
	});

}

function processFiles() {
	github.authenticate({
		type: "basic",
		username: "ralphholzmann",
		password: "tDaGariM!"
	});

	github.repos.getDownloads({
		user : "jupiterjs",
		repo : "canjs"
	}, function( err, downloads ) {

		// Clean up all previous downloads
		var i = 0, count = downloads.length;
		downloads.forEach(function( download ) {
			github.repos.deleteDownload({
				user: "jupiterjs",
				repo: "canjs",
				id: download.id
			}, function() {
				i++;
				if ( i == count ) {
					uploadFiles();
				}
			})
		});

	});


}

// Run Steal build script
pluginify = spawn( "js", ["can/util/make.js"], {
	cwd: rhinoPath
});

pluginify.on("exit", function( code ) {
	if ( code !== 0 ) {
		process.stdout.write("\nError in Steal build script.")
		process.exit( code );
	} else {
		process.stdout.write("\nBuild complete!")
		processFiles();
	}
});

// Clean up on process exit
process.on("exit", function() {
	process.stdout.write("\n")
})

program.prompt("Github Username: ", function( name ) {
	username = name;

	program.password("Github Password: ", "*", function( pass ) {
		password = pass;
		process.stdin.pause();
		processFiles();
	})

});


