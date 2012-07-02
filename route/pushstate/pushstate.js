steal('can/route', function() {

    $(document).on('click', 'a', function(e) {

        var curParams,
            href = $(this).attr("href");

        console.log('href: ' + href);
        console.log('this.href: ' + this.href);
        //console.log('fragment: ' + can.route.getFragment());
        console.log('pathname: ' + location.pathname);
        console.log('path: ' + location.path);

        curParams = can.route.deparam(href);
        console.dir(curParams);

        if(!can.route.updateWith()) {
            console.log('yes');

            history.pushState(null, null, href);
            e.preventDefault();
        }
        else {
            console.log('no');
            e.preventDefault();
        }
        console.log('pathname: ' + location.pathname);
    });

    can.extend(can.route, {

        updateWith: function(href) {
            return false;
        },

        getFragment: function(fragment, forcePushState) {

            var trailingSlash = /\/$/;
            var routeStripper = /^[#\/]/;

            if (fragment == null) {
                if (this._hasPushState || !this._wantsHashChange || forcePushState) {
                    fragment = this.location.pathname;
                    var root = this.options.root.replace(trailingSlash, '');
                    if (!fragment.indexOf(root)){
                        fragment = fragment.substr(root.length);
                    }
                }
                else {
                    fragment = this.getHash();
                }
            }
            return decodeURIComponent(fragment.replace(routeStripper, ''));
        }
    });

});