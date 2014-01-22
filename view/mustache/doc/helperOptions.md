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

@option {*} context The current context the mustache helper is called within.

    
    
    var temp = can.view.mustache(
      "{{#person.name}}{{helper}}{{/person.name}}");
    
    var data = {person: {name: {first: "Justin"}}};
    
    can.Mustache.registerHelper("helper", function(options){
    
      options.context === data.person //-> true
      
    })
    
    
    temp(data);
    
    

@option {can.view.Scope} scope An object that represents the current context and all parent 
contexts.  It can be used to look up [can.Mustache.key key] values in the current scope.

    var temp = can.view.mustache(
      "{{#person.name}}{{helper}}{{/person.name}}");
    
    var data = {person: {name: {first: "Justin"}}};
    
    can.Mustache.registerHelper("helper", function(options){
    
      options.scope.attr("first")   //-> "Justin"
      options.scope.attr("person")  //-> data.person
      
    })
    
    
    temp(data);

@option {can.view.Options} options An object that represents the local mustache helpers.  It can be used to look 
up [can.Mustache.key key] values

    var temp = can.view.mustache(
      "{{#person.name}}{{helper}}{{/person.name}}");
    
    var data = {person: {name: {first: "Justin"}}};
    
    can.Mustache.registerHelper("helper", function(options){
    
      options.options.attr("helpers.specialHelper")   //-> function(){ ... }
      
    })
    
    
    temp(data, {
      specialHelper: function(){ ... }
    });
