var semver = require("semver");
var spawn = require("child_process").spawn;
var path = require("path");

module.exports = engineDependencies;

var apps = { node: true, iojs: true };
var depTypes = { dependencies: true, devDependencies: true };

var engineVersion = process.version;
var engineMajorVersion = +engineVersion.substr(1, engineVersion.indexOf(".") - 1);
var app = engineVersion.substr(0, 3) === "v0." ? "node" :
	engineMajorVersion >= 4 ? "node" : "iojs";
var isWin = /^win/.test(process.platform);

function engineDependencies(options, callback){
	// First see if we are in production
	var installDevDependencies = process.env.NODE_ENV !== "production";
	if(installDevDependencies) {
		// Make sure we are not inside of a node_modules folder
		installDevDependencies = path.basename(path.dirname(process.cwd())) !==
			"node_modules";
	}

	// Get the package.json engineDependencies
	if(!options) {
		var cwd = process.cwd();
		var pkgJsonPath = path.join(cwd, "package.json");
		var pkg = require(pkgJsonPath);
		options = pkg.engineDependencies;
	}

	var dependencies;
	var devDependencies;

	// At this top level the key is the app name (node or iojs);
	var engineOptions = findWhere(options, function(appOption){
		return appOption === app;
	});

	var dependencyOptions = findWhere(engineOptions, function(engineOption){
		return semver.satisfies(engineVersion, engineOption);
	});

	if(!dependencyOptions) {
		callback(new Error("Unable to find options for this version of Node"));
		return;
	}

	// Check to see if this is just version numbers or not
	var exampleDepType = Object.keys(dependencyOptions)[0];
	if(depTypes[exampleDepType]) {
		dependencies = dependencyOptions.dependencies;
		devDependencies = dependencyOptions.devDependencies;
	} else {
		dependencies = dependencyOptions;
	}

	// Now loop through and install the versions.
	var installs = [];
	if(dependencies) {
		installs = mapOf(dependencies, npmInstall);
	}

	if(devDependencies && installDevDependencies) {
		var devInstalls = mapOf(devDependencies, npmInstall);
		installs = installs.concat(devInstalls);
	}

	// Now installs is an array of thunks that will npm install stuff.
	// go through it one-at-a-time and install them all.
	thunkAll(installs, function(err){
		// Should be done, check for the error
		callback && callback(err);
	});
};

function findWhere(obj, callback){
	var keys = Object.keys(obj);
	var result;
	keys.forEach(function(key){
		var value = obj[key];
		var found = callback(key, value);
		if(found) {
			result = value;
			return false;
		}
	});
	return result;
}

function mapOf(obj, callback){
	var keys = Object.keys(obj);
	var results = [];
	keys.forEach(function(key){
		var value = obj[key];
		results.push(callback(key, value));
	});
	return results;
}

function thunkAll(thunks, callback){
	var thunk = thunks.shift();
	if(!thunk) {
		callback();
		return;
	}

	thunk(function(err){
		if(err) {
			return callback(err);
		}
		thunkAll(thunks, callback);
	});
}

var npmCmd = isWin ? "npm.cmd" : "npm";
function npmInstall(packageName, packageVersion){
	return function(done){
		console.error("Engine Dependencies:", packageName, packageVersion);

		var installString = packageName + "@" + packageVersion;
		var args = ["install", installString];
		var child = spawn(npmCmd, args);
		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);
		child.on("exit", done);
	};
}
