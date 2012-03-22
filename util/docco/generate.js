#!/usr/bin/env node

var path          = require('path'),
	fs            = require('fs'),
	sourceDir     = path.join(path.dirname(fs.realpathSync(__filename)), '../../standalone/'),
	child_process = require('child_process');

function runDocco() {

	fs.readdir("temp", function( err, files ) {

		// Prepend temp to each file
		files = files.map(function( file ) {
			return "temp/" + file;
		});

		child_process.exec("node_modules/docco/bin/docco " + files.join(" "), function() {
			fs.readdir("docs", function( err, files ) {
				files.forEach(function( file ) {
					fs.rename( "docs/" + file, "../../docs/" + file );
				});
			});
		});

	});

}

fs.readdir(sourceDir, function( err, files ) {

	var count = 0;

	// Only annotate full srcs
	files = files.filter(function( file ) {
		return file.indexOf(".min.") < 0;
	});

	// Create the temp directory for stripped code
	fs.mkdir("temp", function() {

		// Generate source for all standalones
		files.forEach(function( file ) {
			fs.readFile( sourceDir + file, "utf-8", function( err, code ) {
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
