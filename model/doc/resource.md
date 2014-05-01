
@description A convenience property used to create the other ajaxMethods
@function can.Model.resource resource
@parent can.Model.static
@signature `can.Model.resource: "/path/to/resource"`
If you provide a URL, the Model will send a request to that URL using
the method specified (or PUT if none is specified) when updating an
instance on the server. (See below for more details.)
@return {can.Deferred} A Deferred that resolves to the updated model.

@body
For each of the names (create, update, destroy, findOne, and findAll) use the 
URL provided by the `resource` property. For example:
		
	ToDo = can.Model.extend({
		resource: "/todos"
	}, {});
	
Will create a can.Model that is identical to:
	
	ToDo = can.Model.extend({
		findAll: "GET /todos",
		findOne: "GET /todos/{id}",
		create:  "POST /todos",
		update:  "PUT /todos/{id}",
		destroy: "DELETE /todos/{id}"
	},{});