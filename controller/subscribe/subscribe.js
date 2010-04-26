steal.plugins('jquery','jquery/controller','steal/openajax').then(function(){
    
    var subscribe = (jQuery.Controller.subscribeProcessor = function(el, event, selector, cb, controller){
        var controller = controller; 
        var subscription = OpenAjax.hub.subscribe(selector, cb);
        return function(){
            var sub = subscription;
            OpenAjax.hub.unsubscribe(sub);
        }
    })
    
    jQuery.Controller.processors["subscribe"] = subscribe;
})
