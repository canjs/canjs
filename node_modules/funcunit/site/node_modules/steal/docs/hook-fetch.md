@function steal.hooks.fetch fetch
@parent StealJS.hooks

A loader hook that fetches a module, usually from an http url, returning the source of that module.

@signature `fetch(load)`

@param {load} load The load object associated with this module.

@body

The **fetch** is used to retrieve a module's source, so that it can be passed on to the next loader hook [steal.hooks.translate].

Here's an example of a loader override that stores module source in `localStorage`:

	var oldFetch = loader.fetch;

	loader.fetch = function(load) {
		if(localStorage[load.name]) {
			return localStorage[load.name];
		}

		return oldFetch.call(this, load).then(function(source){
			localStorage[load.name] = source;

			return source;
		});
	};
