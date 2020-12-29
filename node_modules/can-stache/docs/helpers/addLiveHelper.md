@function can-stache.addLiveHelper addLiveHelper
@description Register a helper that gets passed values.
@parent can-stache.static

@signature `stache.addLiveHelper(name, helper)`

  Adds a global helper that will be passed observable values (instead of "unwrapped")
  values.  

  For example, the `name` argument to `upper(name)` is passed as a
  `ScopeKeyData`:

  ```js
  import {stache, Reflect as canReflect, ObservableObject} from "can";

  stache.addLiveHelper( "upper", function( str ) {
	console.log(str); //-> ScopeKeyData{}
  	if ( canReflect.isObservableLike( str ) &&
		canReflect.isValueLike( str ) ) {
  		str = canReflect.getValue( str );
  	}
  	return str.toUpperCase();
  } );
  var data = new ObservableObject({name: "Justin"});
  var frag = stache(`{{upper(name)}}`)(data);

  document.body.append(frag);
  ```
  @codepen

  Notice how [can-reflect] is used to identify if the value is
  observable and read it.

  Typically, you don't want to pass observable values to helper an instead
  want to pass unwrapped values.  Use [can-stache.addHelper] for this.

  `addLiveHelper` is used to provide advanced behavior. The observables
  passed to the `addLiveHelper` callback can be written to.  The following updates
  the observable passed to `incrementEverySecond()`:

  ```js
  import {stache, Reflect as canReflect, ObservableObject, domMutate} from "can";

  stache.addLiveHelper( "incrementEverySecond", ( value ) => {
	var interval = setInterval(function(){
		var current = canReflect.getValue(value);
		canReflect.setValue(value, current+1);
	},1000);

	// Listen to when the element is removed for memory safety.
	return function(el){
		domMutate.onNodeRemoval(el, function(){
			clearInterval(interval);
		})
	}
  } );
  var data = new ObservableObject({age: 1});
  var frag = stache(`{{incrementEverySecond(age)}} Age is: {{age}}`)(data);

  document.body.append(frag);
  ```
  @codepen


@param {String} name The name of the helper.
@param {can-stache.simpleHelper} helper The helper function.

@body
