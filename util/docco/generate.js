#!/usr/bin/env node

var path          = require('path'),
	fs            = require('fs'),
	sourceDir     = path.join(path.dirname(fs.realpathSync(__filename)), '../../standalone/'),
	jsDir         = path.join(path.dirname(fs.realpathSync(__filename)), '../../..'),
	child_process = require('child_process');

function runDocco() {

	fs.mkdir("../../docs", function() {
		fs.readdir("temp", function( err, files ) {

			// Prepend temp to each file
			files = files.map(function( file ) {
				return "temp/" + file;
			});

			console.log( "Generating docco annotated source..." );
			child_process.exec("docco " + files.join(" "), function() {
				fs.readdir("docs", function( err, files ) {
					files.forEach(function( file ) {
						console.log( "\t" + file );
						fs.renameSync( "docs/" + file, "../../docs/" + file );
					});
					console.log("Cleaning up...");
					fs.readdir("temp", function( e, files ) {
						files.forEach(function( file ) {
							fs.unlinkSync("temp/" + file );
						});
						fs.rmdir("temp");
					});
					fs.rmdir("docs");
					console.log("Done!");
				});
			});

		});


	});

}

function stripComments() {
	fs.readdir(sourceDir, function( err, files ) {

		var count = 0;

		// Only annotate full srcs
		files = files.filter(function( file ) {
			return file.indexOf(".min.") < 0;
		});

		// Create the temp directory for stripped code
		fs.mkdir("temp", function() {

			// Generate source for all standalones
			console.log( "Stripping multiline comments from:" );
			files.forEach(function( file ) {
				fs.readFile( sourceDir + file, "utf-8", function( err, code ) {
					console.log( "\t" + file );
					code = code.replace( /\/\*(?:.*)(?:\n\s+\*.*)*/gim, "");
					fs.writeFile("temp/" + file, code, "utf-8", function() {
						if ( ++count == files.length ) {
							runDocco();
						}
					});
				});
			});
		});
	});
}

console.log("generating unminified sources...");
child_process.exec("js can/util/docco/makestandalone.js", {
	cwd : jsDir
}, function( err, stdout, stderr ) {
	console.log( stdout );
	stripComments();
});

