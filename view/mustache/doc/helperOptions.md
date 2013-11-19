@typedef {{fn:can.Mustache.sectionRenderer,inverse:can.Mustache.sectionRenderer,hash:Object}} can.Mustache.helperOptions helperOptions
@parent can.Mustache.types 

@description The options argument passed to a [can.Mustache.helper helper function].

@option {can.Mustache.sectionRenderer} [fn] Provided if a 
[can.Mustache.helpers.sectionHelper section helper] is called.  Call `fn` to
render the BLOCK with the specified `context`.

@option {can.Mustache.sectionRenderer} [inverse] Provided if a 
[can.Mustache.helpers.sectionHelper section helper] is called 
with [can.Mustache.helpers.else {{else}}].  Call `inverse` to
render the INVERSE with the specified `context`.

@option {Object.<String,*|String|Number>} hash An object containing all of the final 
arguments listed as `name=value` pairs for the helper.
	
	{{helper arg1 arg2 name=value other=3 position="top"}}

	options.hash = {
		name: <context_lookup>.value,
		other: 3,
		position: "top"
	}

@option {Array} contexts An array containing the context lookup stack for the current helper.

	{{#section}}
		{{#someObj}}
			{{#panels}}
				{{helper}}
			{{/panels}}
		{{/someObj}}
	{{/section}}

	options.contexts = [
		<root_scope>,
		<context_lookup>.section,
		<context_lookup>.someObj,
		panel
	]
