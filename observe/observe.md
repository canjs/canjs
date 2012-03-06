@class can.Observe
@parent index
@test can/observe/qunit.html

can.Observe provides the observable pattern for
JavaScript Objects. It lets you

  - Set and remove property or property values on objects
  - Listen for changes in objects and arrays
  - Work with nested properties


## Creating an Observe

To create an observable object, use `new can.Observe( OBJECT )` like:

    var person = new can.Observe({name: 'justin', age: 29})
    
To create an observable array, use `new can.Observe.List( ARRAY )` like:

    var hobbies = new can.Observe.List(['programming', 
                                   'basketball', 
                                   'nose picking'])

  
can.Observe and [can.Observe.List] are very similar. In fact,
can.Observe.List inherits can.Observe and only adds a few extra methods for
manipulating arrays like [can.Observe.List::push push].  Go to
[can.Observe.List] for more information about lists.

`Observe` works with nested objects and arrays, so the following works:

    var data = { 
      addresses : [
        {
          city: 'Chicago',
          state: 'IL'
        },
        {
          city: 'Boston',
          state : 'MA'
        }
        ],
      name : "Justin Meyer"
    },
    o = new can.Observe(data);
    
_o_ now represents an observable copy of _data_.  

Observe is inherited by [can.Model].

## Getting and Setting Properties

Use [can.Observe::attr attr] to get and set properties.

For example, you can __read__ the property values of _o_ with
`observe.attr( name )` like:

    // read name
    o.attr('name') //-> Justin Meyer
    
And __set__ property names of _o_ with 
`observe.attr( name, value )` like:

    // update name
    o.attr('name', "Brian Moschel") //-> o

Observe handles nested data.  Nested Objects and
Arrays are converted to can.Observe and 
can.Observe.Lists.  This lets you read nested properties 
and use can.Observe methods on them.  The following 
updates the second address (Boston) to 'New York':

    o.attr('addresses.1').attr({
      city: 'New York',
      state: 'NY'
    })

`attr()` can be used to get all properties back from the observe:

    o.attr() // -> 
    { 
      addresses : [
        {
          city: 'Chicago',
          state: 'IL'
        },
        {
          city: 'New York',
          state : 'MA'
        }
      ],
      name : "Brian Moschel"
    }


## Listening to property changes

When a property value is changed, it creates events
that you can listen to.  There are two ways to listen
for events:

  - [can.Observe::bind bind] - listen for any type of change
  - [can.Observe::delegate delegate] - listen to a specific type of changes
    
    
    
With `bind( "change" , handler( ev, attr, how, newVal, oldVal ) )`, you can listen
to any change that happens within the 
observe. The handler gets called with the property name that was
changed, how it was changed ['add','remove','set'], the new value
and the old value.

    o.bind('change', function( ev, attr, how, nevVal, oldVal ) {
    
    })

`delegate( attr, event, handler(ev, newVal, oldVal ) )` lets you listen
to a specific event on a specific attribute. 

    // listen for name changes
    o.delegate("name","set", function(){
    
    })
    
Delegate lets you specify multiple attributes and values to match 
for the callback. For example,

    r = $.O({type: "video", id : 5})
    r.delegate("type=images id","set", function(){})
    

@constructor

@param {Object} obj a JavaScript Object that will be 
converted to an observable
