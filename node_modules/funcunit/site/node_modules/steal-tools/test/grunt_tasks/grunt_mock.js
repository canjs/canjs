function Grunt() {
	var self = this;

	this.done = new Promise(function(resolve, reject){
		self.resolve = resolve;
		self.reject = reject;
	});

	this.log = { writeln: function(){} };
}

Grunt.prototype.registerMultiTask = function(name, desc, callback){
	this.callback = callback;
};

Grunt.prototype.options = function(){
	return this._options;
};

Grunt.prototype.async = function(){
	return function(error){
		if (!error) {
			this.resolve();
		}
		else {
			this.reject(error);
		}
	}.bind(this);
};

Grunt.prototype.run = function(options){
	this._options = options;
	this.callback();

	return this.done;
};

module.exports = Grunt;
