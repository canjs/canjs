include.apps('jquery','jquery/controller','jmvc/openajax').then(function(){
    
    var subscribe = (jQuery.Controller.subscribeProcessor = function(el, event, selector, cb, controller){
        var controller = controller; 
        var subscription = OpenAjax.hub.subscribe(selector, function(called, data) {
              cb.call(controller, called, data);
        });
        return function(){
            var sub = subscription;
            OpenAjax.hub.unsubscribe(sub);
        }
    })
    
    jQuery.Controller.processors["subscribe"] = subscribe;
})
