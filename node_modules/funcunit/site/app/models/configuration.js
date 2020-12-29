import can from 'can';
import Bitovi from '../bitovi';

can.Model('Bitovi.OSS.Configuration', {
	configuration: null,
	// the configuration is not going to change,
	// and it's pretty much a singleton, so:
	findOne: function() {
		if(Bitovi.OSS.Configuration.configuration === null) {
			Bitovi.OSS.Configuration.configuration = $.ajax({
				url: Bitovi.URL.BUILDER_DATA,
				dataType: 'jsonp'
			});
		}

		return Bitovi.OSS.Configuration.configuration;
	},
	model: function(data) {
		var libraries = [];
		can.each(data.configurations, function(library, id) {
			library.id = id;
			libraries.push(library);
		});

		var types = {};
		can.each(data.types, function(description, id) {
			types[id] = {
				id: id,
				description: description,
				modules: []
			};
		});

		can.each(data.modules, function(module, path) {
			module.id = Bitovi.OSS.Configuration.pathToID(path);
			module.path = path;
			types[module.type].modules.push(module);
		});

		return {
			name: data.name,
			version: data.version,
			description: data.description,
			libraries: libraries,
			types: types,
			modules: data.modules
		};
	},
	pathToID: function(path) {
		return path.split('/').join('-').split('.').join('_');
	},
	idToPath: function(id) {
		return id.split('_').join('.').split('/').join('/');
	}
}, { });