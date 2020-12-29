"use strict";
var stealTools = require("steal-tools");

stealTools.export({
    steal: {
        main: ["can-define", "can-define/map/map", "can-define/list/list"],
        config: __dirname + "/package.json!npm"
    },
    outputs: {
        "+amd": {},
        "+standalone": {
          modules: ["can-define", "can-define/map/map", "can-define/list/list"],
          exports: {
            "can-namespace": "can"
          }
        }
    }
}).catch(function(e){
    setTimeout(function(){
        throw e;
    }, 1);
});
