@parent index
@page migrate Migrating

## Models

### No Conversion Necessary

Before when you would have to include the type of the model in the AJAX parameters, now
when you return a deferred this is handled automatically.  So for example, the following:

	$.Model('Cookbook', {
		findAll : function(params, success, error){
			return $.get("/recipes.json", {}, 
				success, "json contact.models");
		}
	}, {});S
	
becomes:

	$.Model('Cookbook', {
		findAll : function(params, success, error){
			return $.get("/recipes.json", {}, success, "json");
		}
	}, {});