var SimpleObservable = require("can-simple-observable");
var canReflect = require("can-reflect");

function MockRoute(){
    this.routeValue = new SimpleObservable("");
}
canReflect.assignMap(MockRoute.prototype,{
    paramsMatcher: /^(?:&[^=]+=[^&]*)+/,
    querySeparator: "&",
    // don't greedily match slashes in routing rules
    matchSlashes: false,
    root: "#!",
    get: function(){
        return this.value;
    },
    set: function(newVal){
        return this.value = newVal;
    },
    on: function(handler){
        canReflect.onValue(this, handler);
    },
    off: function(handler){
        canReflect.offValue(this, handler);
    }
});

Object.defineProperty(MockRoute.prototype,"value",{
    get: function(){
        return this.routeValue.get().split(/#!?/)[1] || "";
    },
    set: function(path){
        if(path[0] !== "#") {
			this.routeValue.set("#"+(path || ""));
		} else {
			this.routeValue.set(path || "");
		}
		return path;
    }
});

canReflect.assignSymbols(MockRoute.prototype,{
    "can.onValue": function(handler){
        this.routeValue.on(handler);
    },
    "can.offValue": function(handler) {
        this.routeValue.off(handler);
    },
    // Gets the part of the url we are determinging the route from.
    // For hashbased routing, it's everything after the #, for
    // pushState it's configurable
    "can.getValue": function() {
        return this.value;
    },
    // gets called with the serializedcanRoute data after a route has changed
    // returns what the url has been updated to (for matching purposes)
    "can.setValue": function(path){
		this.value = path;
    }
});


module.exports = MockRoute;
