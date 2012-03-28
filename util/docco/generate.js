var path          = require('path'),
	fs            = require('fs'),
	child_process = require('child_process'),
	os            = require('os'),

	// Resolve directories
	rhinoDir      = path.join( path.dirname( fs.realpathSync( __filename )), '../../..' ),
	canDir        = path.join( rhinoDir, 'can' ),
	docsDir       = path.join( canDir, "docs" ),
	doccoDir      = path.join( canDir, "util/docco" ),
	doccoOutDir   = path.join( doccoDir, "docs" ),
	sourceDir     = path.join( doccoDir, 'standalone' ),
	makePath      = path.join( doccoDir, "makestandalone.js" ),
	genCommand;

function execCommandWithOutput( command, cwd, callback ) {

	var spawn, parts;

	parts = command.split(" ");
	spawn = child_process.spawn( parts.shift(), parts, {
		cwd : cwd,
		env : process.env
	});

	["stdout", "stderr"].forEach( function( stream ) {
		spawn[stream].setEncoding("utf-8");
		spawn[stream].pipe( process[stream] );
	});

	spawn.on("exit", callback );

}

function runDocco() {

	fs.mkdir(docsDir, function() {

		fs.readdir("temp", function( err, files ) {
		
			var command = os.platform() != "win32" ?
				"docco " :
				"sh docco ";

			// Prepend temp to each file
			files = files.map(function( file ) {
				return path.join( "temp", file );
			});

			console.log( "Generating docco annotated source..." );

			execCommandWithOutput( command + files.join(" "), doccoDir, function() {
				fs.readdir( doccoOutDir, function( err, files ) {
					console.log("Moving files into place...");
					files.forEach(function( file ) {
						console.log( "\t" + file );
						fs.renameSync( "docs/" + file, "../../docs/" + file );
					});
					console.log("Cleaning up...");
					["temp", "standalone", "docs"].forEach(function( dir ) {
						fs.readdir( dir, function( e, files ) {
							files.forEach(function( file ) {
								fs.unlinkSync( path.join( dir, file ));
							});
							fs.rmdir( dir );
						});
					});
					console.log("Done!");
				});
			})

		});

	});

}

function format( exitCode ) {

	if ( exitCode != 0 ) {
		console.log("Error generating unminified sources.");
		return
	}

	fs.readdir( sourceDir, function( err, files ) {

		var count = 0;

		if ( ! files.length ) {
			console.log("Error - Source directory is empty");
		}

		// Only annotate full srcs
		files = files.filter(function( file ) {
			return file.indexOf(".min.") < 0;
		});

		// Create the temp directory for stripped code
		fs.mkdir("temp", function() {

			// Generate source for all standalones
			console.log( "Stripping multiline comments and converting tabs to four spaces:" );

			files.forEach(function( file ) {
				fs.readFile( path.join( sourceDir, file ), "utf-8", function( err, code ) {
					console.log( "\t" + file );
					code = code.replace( /\/\*(?:.*)(?:\n\s+\*.*)*/gim, "");
					code = code.replace( /\t/gim, "    ");
					fs.writeFile( path.join( "temp", file ), code, "utf-8", function() {
						if ( ++count == files.length ) {
							runDocco();
						}
					});
				});
			});
		});
	});
}

console.log("Generating unminified sources...");

if ( os.platform() != "win32" ) {
	genCommand = "./js " + makePath;
} else {
	genCommand = "js.bat " + makePath;
}

execCommandWithOutput( genCommand, rhinoDir, format );
