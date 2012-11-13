var program = require("commander");
var GitHubApi = require("github");
var authenticated = false;
var fs = require('fs');
var github = new GitHubApi({
	version : "3.0.0"
});
var getCredentials = function (callback) {
	if(authenticated) {
		return callback();
	}

	program.prompt("Github Username: ", function (name) {
		var username = name;

		program.password("Github Password: ", "*", function (pass) {
			var password = pass;
			process.stdin.pause();
			github.authenticate({
				type : "basic",
				username : username,
				password : password
			});
			authenticated = true;
			callback();
		});

	});
}

module.exports = function (grunt) {
	grunt.registerMultiTask('downloads', 'Uploads generated files as GitHub downloads.', function () {
		if(this.target == '_options') {
			return;
		}

		var _ = grunt.utils._;
		var done = this.async();
		var ops = grunt.config(['downloads', this.target]);
		var defaults = _.extend({}, grunt.config(['downloads', '_options']));
		var sourceFile = this.file.src;

		var desc = grunt.template.process(ops.description);
		var name = grunt.template.process(ops.filename);

		grunt.log.writeln('Deploying ' + desc);
		fs.readFile(sourceFile, function (err, buf) {
			if (err) {
				return grunt.fail.fatal(err);
			}

			var createDownload = function() {
				github.httpSend({
					"user" : defaults.user,
					"repo" : defaults.repository,
					"name" : name,
					"size" : buf.length,
					"description" : desc,
					"content_type" : ops.content_type || "text/javascript"
				}, {
					"url" : "/repos/:user/:repo/downloads",
					"method" : "POST",
					"params" : {
						"$user" : null,
						"$repo" : null,
						"$name" : null,
						"$size" : null,
						"description" : null,
						"$content_type" : null
					}
				}, function (err, socket) {
					if(err) {
						return grunt.fail.fatal(err);
					}
					var data = JSON.parse(socket.data);

					grunt.utils.s3.postToS3({
						key : data.path,
						acl : data.acl,
						success_action_status : "201",
						Filename : data.name,
						AWSAccessKeyId : data.accesskeyid,
						policy64 : data.policy,
						signature64 : data.signature,
						contentType : data.mime_type,
						data : buf,
						bucket : "github"
					}, function (e) {
						if(e) {
							return grunt.fail.fatal(e);
						}
						grunt.log.writeln('Successfully created GitHub download and uploaded to S3.');
						done();
					})
				});
			}

			grunt.log.writeln('Uploading to ' + defaults.user + '/' + defaults.repository + '/' + name);
			getCredentials(createDownload);

		});
	});
}