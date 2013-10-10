@property {Object} can.route.pushstate
@download can/route/pushstate
@test can/route/pushstate/test.html
@parent can.route.plugins

@description Changes [can.route] to use
[pushstate](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history)
to change the window's [pathname](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.pathname) instead
of the [hash](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.hash).


@option {Object} The pushstate object comprises several properties that configure the behavior of
[can.route] to work with `history.pushstate`.

@body

## Use

The pushstate plugin uses the same API as [can.route] with only one additional 
property - [can.route.pushstate.root].  `can.route.pushstate.root` specifies the part of that pathname that
should not change. For example, if we only want to have pathnames within `app.com/contacts/`,
we can specify a root like:

    can.route.pushstate.root = "/contacts/"
    can.route(":page\\.html");
    can.route.url({page: "list"}) //-> "/contacts/list.html"

Now, all routes will start with "/contacts/". The default [can.root.route] 
is "/". 

