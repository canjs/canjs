var npm = require("npm");
var	fs = require('fs-extra');

var path = require("path");
var Q = require("q");
var remove = Q.denodeify(fs.remove);
var move = Q.denodeify(fs.move);
var copy = Q.denodeify(fs.copy);
var getProjectName = require("./project_name");
var ghdownload = require('documentjs-github-download'),
	mkdirs = Q.denodeify(fs.mkdirs);

/**
 * @function documentjs.configured.getProject
 * @parent documentjs.configured.methods
 *
 * Copies or downloads a project to `project.path`.
 *
 * @signature `documentjs.configured.getProject( project )`
 *
 * @param {{}} project A [documentjs.configured.projectConfig] object with the following properties:
 *
 * @option {String} source A path to a file, a url to a git repository, or a
 * [npm install](https://www.npmjs.org/doc/cli/npm-install.html) target.
 *
 * @option {Boolean} [npmInstall=false] Set to `true` to use npm to install
 * the resource.
 *
 * @option {String} path The path to install the project.
 *
 * @return {Promise} A promise that resolves when the resource has been retrieved successfully.
 *
 * @body
 * ## Use
 *
 * By default, `getProject` will simply download the repository to `project.path`:
 *
 *     documentjs.configured.getResource({
 *       source: "git://github.com/bitovi/comparify#master",
 *       path: __dirname+"/tmp"
 *     }).then(function(){
 *         // retrieved!
 *       });
 *
 * If you want `npm` to install the resource:
 *
 *     documentjs.configured.getResource(
 *       {
 *         source: "comparify@0.2.0",
 *         npmInstall: true,
 *         path: __dirname+"/tmp"
 *       },
 *       ).then(function(){
 *         // retrieved!
 *       });
 */
module.exports = function(project){
	var projectName = getProjectName(project.source);
	var finalDest = project.path;

	var removePromise = remove(finalDest).then(function(){
		return mkdirs(finalDest);
	});

	// check if project.source is a local file
	if(	( project.source.indexOf("/") === 0 ||
			project.source.indexOf("//") >= 0 || project.source.indexOf(":\\") >= 0 ) &&
			fs.existsSync(project.source) ) {

			return removePromise.then(function(){
				return copy(project.source,finalDest);
			});

	} else if(project.npmInstall === true) {
		var npmDeferred = Q.defer();

		npm.load({
		    loaded: false
		}, function (err) {
		  // catch errors
			npm.commands.install(__dirname+"/tmp",[project.source], function(err, data){
				if(err) {
					npmDeferred.reject(err);
				} else {
					npmDeferred.resolve(data);
				}
			});
		});

		return Q.all([removePromise, npmDeferred.promise]).then(function(){
			return move(
				path.join(__dirname,"/tmp/node_modules",projectName),
				finalDest);
		});
	} else {
		var ghDownloadDeferred = Q.defer();
		return removePromise.then(function(){
			console.log("downloading",project.source);
			ghdownload(project.source, finalDest)
				.on('zip', function(zipUrl) { //only emitted if Github API limit is reached and the zip file is downloaded
				  console.log("Using zip dowload.  This might take a few miniutes.");
				})
				.on('error',function(err){
					console.log("ERROR", err);
					ghDownloadDeferred.reject(err);
				})
				.on('end', function(){
					if(project.npmInstall) {
						npmInstall(finalDest, project.npmInstall, function(err, data){
							if(err) {
								ghDownloadDeferred.reject(err);
							} else {
								ghDownloadDeferred.resolve(data);
							}
						});

					} else {


						fs.readFile(path.join(finalDest,"package.json"), function(err, source) {
							if(err) {
								ghDownloadDeferred.resolve();
							}
							var packageJSON;
							try {
								packageJSON = JSON.parse(source);
							} catch(e){
								ghDownloadDeferred.resolve();
							}
							if(packageJSON.docDependencies) {

								var installs = [];
								for(var name in packageJSON.docDependencies) {
									installs.push(name+"@"+packageJSON.docDependencies[name]);
								}

								npmInstall(finalDest, installs, function(err, data){
									if(err) {
										ghDownloadDeferred.reject(err);
									} else {
										ghDownloadDeferred.resolve(data);
									}
								});
							} else {
								ghDownloadDeferred.resolve();
							}

						});

					}
				});
			return ghDownloadDeferred.promise;
		});
	}

};



var npmInstall = function(finalDest, installs, callback ) {

	npm.load({
	    loaded: false,
        "onload-script": false,
        "script-ssl": false,
        "registry": "http://registry.npmjs.org"
	}, function (err) {
		if(err) {
			console.error("Unable to load npm:", err);
			return callback(err);
		}

		console.log("npm install", installs);
		npm.commands.install( finalDest, installs, callback);
	});

};
