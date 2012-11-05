var spawn = require("child_process").spawn;

//	{
//		// The command to execute. It should be in the system path.
//		cmd: commandToExecute,
//		// An array of arguments to pass to the command.
//		args: arrayOfArguments,
//		// Additional options for the Node.js child_process spawn method.
//		opts: nodeSpawnOptions
//	}

module.exports = function(grunt) {
	grunt.utils.exec = function(options, callback) {
		var build = grunt.utils.spawn(options, callback);

		build.stdout.on("data", function( buf ) {
			grunt.log.write( "" + buf );
		});

		build.stderr.on("data", function( buf ) {
			grunt.log.write( "" + buf );
		});

		build.on("exit", function( code ) {
			callback(null, code);
		});

		return build;
	}
}