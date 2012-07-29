steal('can/route', function() {
    "use strict";

    if(window.history && history.pushState) {
        var param = can.route.param,
            paramsMatcher = /^\?(?:[^=]+=[^&]*&)*[^=]+=[^&]*/;
        can.extend(can.route, {
            _paramsMatcher: paramsMatcher,
            _querySeparator: '?',
            _setup: function() {
                // intercept routable links
                can.$('body').on('click', 'a', function(e) {
                    if(can.route.updateWith(this.pathname+this.search)) {
                        e.preventDefault();
                    }
                });
                // Bind to popstate event, which fires on all history changes
                can.bind.call(window, 'popstate', can.route.setState);
            },
            updateWith: function(href) {
                var curParams = can.route.deparam(href);

                if(curParams.route) {
                    can.route.attr(curParams, true);
                    return true;
                }
                return false;
            },
            _getHash: function() {
                return location.pathname + location.search;
            },
            _setHash: function(serialized) {
                var path = can.route.param(serialized, true);
                if(path !== can.route._getHash()) {
                    history.pushState(null, null, path);
                }
                return path;
            },
            current: function( options ) {
                return this._getHash() === can.route.param(options);
            },
            url: function( options, merge ) {
                if (merge) {
                    options = can.extend({}, can.route.deparam( this._getHash()), options);
                }
                return can.route.param(options);
            }
        });
    }
});
