@function can-map-define.ValueConstructor Value
@parent can-map-define

Provides a constructor function to be used to provide a default value for a certain property of a [can-map Map].  This constructor will be invoked with `new` each time a new instance of the map is created.

@signature `constructorFunc`

A constructor function can be provided that is called to create a default value used for this property, like:

    define: {
      prop: {
        Value: Array
      },
      person: {
      	Value: Person
      }
    }

@body

Similar to [can-map-define.value value], this uppercase version provides a mechanism for providing a default value.  If the default value is an object, providing a constructor is a good way to ensure a copy is made for each instance.
