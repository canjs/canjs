steal.plugins('jquery','jquery/controller','steal/openajax').then(function(){
    

    /**
     * Adds open ajax subscribing to controllers.
     */
    jQuery.Controller.processors.subscribe = function(el, event, selector, cb, controller){
        var controller = controller; 
        var subscription = OpenAjax.hub.subscribe(selector, cb);
        return function(){
            var sub = subscription;
            OpenAjax.hub.unsubscribe(sub);
        }
    };
})
