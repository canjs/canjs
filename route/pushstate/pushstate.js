steal('can/route', function() {

    // I realize this a jQuery-based solution and this will need to use can.bind or something similar
    $(document).on('click', 'a', function(e) {

        var curParams,
            href = $(this).attr("href");

        if(can.route.updateWith(href)) {

            // Don't think this is needed here as it will be handled inside the change event handler for can.route
            //history.pushState(null, null, href);

            e.preventDefault();
        }
        else {  
           // Link should be followed normally as a route was not matched
        }
    });

    can.extend(can.route, {

        // Can this be used as the hook so can.route knows we are using pushState???
        usePushState: !!(window.history && window.history.pushState),

        updateWith: function(href) {
            var curParams = can.route.deparam(href);

            if(curParams.route) {
                can.route.attr(curParams, true);
                return true;
            }
            return false;
        }
    });

    var doPopState = function() {
        console.log("POPSTATE: pathname: "+location.pathname);

        // Rest of code for popstate handling goes here...
    };

    if(can.route.usePushState) {

        // Can we do this so that can.route doesn't listen to hashchange???
        can.unbind.call(window,'hashchange', can.route.setState);

        // Bind to popstate event
        can.bind.call(window, 'popstate', doPopState);
    }
});