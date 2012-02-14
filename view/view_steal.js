steal("./view",function( $ ) {

	if ( window.steal ) {
		steal.type("view js", function( options, success, error ) {
			var type = Can.view.types["." + options.type],
				id = toId(options.rootSrc);

			options.text = "steal('" + (type.plugin || "jquery/view/" + options.type) + "').then(function($){" + "Can.View.preload('" + id + "'," + options.text + ");\n})";
			success();
		})
	}


	$.extend(Can.view, {
		register: function( info ) {
			this.types["." + info.suffix] = info;

			if ( window.steal ) {
				steal.type(info.suffix + " view js", function( options, success, error ) {
					var type = Can.view.types["." + options.type],
						id = toId(options.rootSrc+'');

					options.text = type.script(id, options.text)
					success();
				})
			}
		},
		registerScript: function( type, id, src ) {
			return "$.View.preload('" + id + "'," + $view.types["." + type].script(id, src) + ");";
		},
		preload: function( id, renderer ) {
			Can.view.cached[id] = function( data, helpers ) {
				return renderer.call(data, data, helpers);
			};
		}

	});
	if ( window.steal ) {
		steal.type("view js", function( options, success, error ) {
			var type = Can.view.types["." + options.type],
				id = toId(options.rootSrc+'');

			options.text = "steal('" + (type.plugin || "jquery/view/" + options.type) + "').then(function($){" + "$.View.preload('" + id + "'," + options.text + ");\n})";
			success();
		})
	}

});