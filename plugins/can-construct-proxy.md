@page can-construct-proxy
@parent canjs.plugins

@link http://www.npmjs.com/package/can-construct-proxy npm
@link http://canjs.github.io/can-construct-proxy/docs docs
@link http://github.com/canjs/can-construct-proxy github

@body

- [Usage Guide](http://canjs.github.io/can-construct-proxy/docs/usage.html)
- [API Docs](http://canjs.github.io/can-construct-proxy/docs/api.html)
- [GitHub](http://github.com/canjs/can-construct-proxy)

[can-construct-proxy](http://canjs.github.io/can-construct-proxy/docs) is a plugin that creates a static callback function that has `this` set to an instance of the constructor function.

For instance:

```
var Animal = can.Construct.extend({
    init: function(name) {
        this.name = name;
    },
    speak: function (words) {
        console.log(this.name + ' says: ' + words);
    }
});
var dog = new Animal("Gertrude");
// Passing a function
var dogDance = dog.proxy(function(dance){
    console.log(this.name + ' loves dancing the ' + dance);
});
dogDance('hokey pokey'); // Gertrude loves dancing the hokey pokey
```