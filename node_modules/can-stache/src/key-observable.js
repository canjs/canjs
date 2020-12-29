"use strict";
var SettableObservable = require("can-simple-observable/settable/settable");
var stacheKey = require("can-stache-key");


function KeyObservable(root, key){
    key = ""+key;
    this.key = key;
    this.root = root;
    SettableObservable.call(this, function(){
        return stacheKey.get(this,key);
    }, root);
}

KeyObservable.prototype = Object.create(SettableObservable.prototype);

KeyObservable.prototype.set = function(newVal) {
    stacheKey.set(this.root,this.key, newVal);
};


module.exports = KeyObservable;
