steal.plugins('jquery/event/drag').then(function($){
	var event = $.event;
	//somehow need to keep track of elements with selectors on them.  When element is removed, somehow we need to know that
	//
	$.Drop = function(){}
    $.each(["dropover","dropon","dropout","dropinit","dropmove","dropend"], function(){
			event.special[this] = {
				setup : function(data, namespaces, eventHandle){
                    //add this element to the compiles list
                    console.log("setup",this, data, namespaces, eventHandle)
                },
                teardown : function(){
                    console.log("teardown",this)
                    //remove this element from the list only if there is no other event
                }
			}
	})
    $.extend($.Drop,{
        _elements: [],
        addElement : function(el){
            //check other elements
            for(var i =0; i < this._elements.length ; i++  ){
                if(el ==this._elements[i]) return;
            }
            this._elements.push(el);
        },
        removeElement : function(el){
             for(var i =0; i < this._elements.length ; i++  ){
                if(el == this._elements[i]){
                    this._elements.splice(i,1)
                    return;
                }
            }
        },
        compile : function(){
            console.log('compile')
        },
        show : function(){
            console.log('show')
        },
        end : function(){
            console.log('end')
        }
    })
	$.Drag.responder = $.Drop
});