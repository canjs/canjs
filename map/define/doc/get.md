@function can.Map.prototype.define.get get
@parent can.Map.prototype.define

Specify what happens when a certain property is read on a map.


@signature `get( )`

A get function defines the behavior of what happens when a value is read on a
[can.Map]. It is typically used to provide properties that derive their value from other properties of the map.

@return {*} Anything can be returned from a getter.

@body

## Use

Getter methods are useful for defining virtual properties on a map. These are properties that don't actually store any value, but derive their value from some other properties on the map.

Whenever a getter is provided, it is wrapped in a [can.compute], which ensures that whenever its dependent properties change, a change event will fire for this property also.

@codestart
var Person = can.Map.extend({
	define: {
		fullName: {
			get: function () {
				return this.attr("first") + " " + this.attr("last");
			}
		}
	}
});

var p = new Person({first: "Justin", last: "Meyer"});

p.attr("fullName"); // "Justin Meyer"
@codeend

Below is another example of using get to create a dependent "virtual" property. This map has a locations property, which is a can.List containing location objects. Another property called locationIds is required, which is just an array of ids from each of the locations in the real location list. The value of locationIds is tied to locations, so a getter is useful. A user could bind to 'locationIds' and its event handler would be triggered if new locations were added, causing a change in the locationIds array.

@codestart
var Store = can.Map.extend({
	define: {
		locationIds: {
			get: function(){
				var ids = [];
				this.attr('locations').each(function(location){
					ids.push(location.id);
				});
				return ids;
			}
		}
	}
});
@codeend