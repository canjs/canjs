@function can.Map.prototype.define.serialize serialize
@parent can.Map.prototype.define

Called when an attribute is removed.

@signature `serializer( currentValue )`

@return {*|false} If `false` is returned, the value is not serialized.

@body 

## Use

[can.Map::serialize serialize] is useful for serializing a can.Map instance into a more JSON-friendly form.  This can be used for many reasons, including saving a can.Model instance on the server or serializing can.route's internal can.Map for display in the hash or pushstate URL.

The serialize property allows an opportunity to define how each attribute will behave when the map is serialized.  This can be useful for:

* serializing complex types like dates, arrays, or objects into string formats
* causing certain properties to be ignored when serialize is called

The following causes a locationIds property to be serialized into the comma separated ID values of the location property on this map:

    define: {
      locationIds: {
        serialize: function(){
		  var ids = [];
		  this.attr('locations').each(function(location){
		    ids.push(location.id);
		  });
		  return ids.join(',');
        }
      }
    }

Setting serialize to false for any property means this property will not be part of the serialized object.  For example, if the property numPages is not greater than zero, the following example won't include it in the serialized object.

    define: {
      prop: {
        numPages: function( num ){
          if(num <= 0) {
          	return false;
          }
          return num;
        }
      }
    }
