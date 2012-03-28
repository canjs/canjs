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
	}, {});
	
becomes:

	$.Model('Cookbook', {
		findAll : function(params, success, error){
			return $.get("/recipes.json", {}, success, "json");
		}
	}, {});
	
### Model Element Helpers Removed

We removed the `.model()` and `.models()` helpers in favor of using traditional data accessors.
Now when you want to retrieve models from a element you bound them to, simply do: 
`can.$('#myelm').data('model')` or to update `can.$('#myelm').data('model', modelInstance)`.