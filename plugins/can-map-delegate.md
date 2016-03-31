@page can-map-delegate
@parent canjs.plugins

@link http://www.npmjs.com/package/can-map-delegate npm
@link http://canjs.github.io/can-map-delegate/docs docs
@link http://github.com/canjs/can-map-delegate github

- [Usage Guide](http://canjs.github.io/can-map-delegate/docs/can-map-delegate.delegate.html)
- [API Docs](http://canjs.github.io/can-map-delegate/docs/can.Map.prototype.delegate.html)
- [GitHub](http://github.com/canjs/can-map-delegate)

The delegate plugin allows you to listen to more specific event changes on [can.Map Maps]. It allows you to specify:

- the attribute or attributes - that you want to listen to and optionally the value you want it to match
- the type of event (add,set,remove,change)

For instance, you can listen to specific event changes with delegate(selector, event, handler(ev,newVal,oldVal,from))` like so:

```
// create an observable
var map = new can.Map({
  name : {
    first : "Justin Meyer"
  }
})
var handler;
//listen to changes on a property
map.delegate("name.first","set", 
  handler = function(ev, newVal, oldVal, prop){
  
  console.log(this)   //-> "Justin"
  console.log(ev.currentTarget) //-> map
  console.log(newVal) //-> "Justin"
  console.log(oldVal) //-> "Justin Meyer"
  console.log(prop)   //-> "name.first"
});

// change the property
map.attr('name.first',"Justin")
```