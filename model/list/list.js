steal.plugins('jquery/model').then(function(){

$.Class.extend("jQuery.Model.List",{
    init : function(instances){
        this.length = 0;
        Array.prototype.push.apply( this, $.makeArray(instances || [] ) );
    },
    push: [].push,
    sort: [].sort,
    splice: [].splice,
    slice : function(){
        Array.prototype.slice.apply( this, arguments )
    },
    match : function(property, value){
        return this.grep(function(inst){
            return inst[property] == value;
        })
    },
    each : function(callback, args){
        return jQuery.each( this, callback, args );
    },
    grep : function(callback, args){
        return jQuery.grep( this, callback, args );
    },
    map : function(callback, args){
        return jQuery.map( this, callback, args );
    },
    isOne : function(){
        return this.length == 1;
    }
})

})