var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path'),
	_ = require("lodash");

var mkdirs = Q.denodeify(fs.mkdirs),
	copy = Q.denodeify(fs.copy),
	readFile = Q.denodeify(fs.readFile),
	readdir = Q.denodeify(fs.readdir),
	// supports other names for documentjs (#95)
	root = path.dirname(__dirname);


exports.join = function(){
	return path.join.apply(path, [root].concat(_.toArray(arguments)));	
};

exports.copy = function(src, dest){
	return copy(path.join(root, src), path.join(root,dest) );
};
exports.copyTo = function(src, dest){
	return copy(path.join(root, src), dest );
};
// relative to documentjs on the destination
exports.copyFrom = function(src, dest){
	return copy(src, path.join(root, dest ) );
};

exports.mkdirs = function(dir){
	return mkdirs( path.join(root, dir) );
};
exports.exists = function(dir){
	var deferred = Q.defer();
	fs.exists( path.join(root, dir), function(exists){
		deferred.resolve(exists);
	});
	return deferred.promise;
};
exports.readFile = function(filename){
	return readFile( path.join(root, filename) );
};
exports.readdir = function(filename){
	return readdir( path.join(root, filename) );
};
// smart join always keeps "rooted" paths like /user/justin and c:\abc even if they
// are later arguments
exports.smartJoin = function(){
	var args = _.toArray(arguments);
	for(var i = args.length - 1; i >=0; i--){
		var arg = args[i];
		if(arg.indexOf("/") === 0 || /^\w+\:[\/\\]/.test(arg)) {
			args = args.slice(i);
			break;
		}
	}
	return path.join.apply(path, args);
};
