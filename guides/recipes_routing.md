@page RecipesRouting Routing
@parent Recipes 2

@body
The following recipes explore using `can.route`.


### History Tabs

This recipe shows how to make a history-based tabs widget and have routes
configured independently by can.route.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/556by/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

#### How it works

The HTML is structured such that each tab button has an `<a>` element with an 
href property that matches the `id` attribute of the tab content 
panel it should show.  This means that even if JavaScript was disabled,
clicking a button would send the user to the tab panel (even though
HistoryTabs overwrites this behavior).

For example:

@codestart
&lt;li>&lt;a href="#model">can.Model&lt;/a>&lt;/li>
@codeend

references:

@codestart
&lt;div id="model" class="tab">
@codeend

The JavaScript code begins by creating a `HistoryTabs` 
control.  When a new `HistoryTabs` instance is created, it gets
an __attr__ option like:

@codestart
new HistoryTabs( '#components',{attr: 'component'});
@codeend

The __attr__ method is used to configure which part of `can.route`'s data the 
history tab will be listening to.  

When `init` is called, it hides each tab button's content div, looking up
the content div with the `tab` helper method.  It then reads the current 
active tab with:

@codestart
var active = can.route.attr(this.options.attr);
@codeend

It passes that value to the `active` helper which will hide the old active
content (if `oldActive` is passed) and activate the new active button and
show it's content.

`HistoryTab` updates the active tab by listening when a tab button is clicked with
`"li click"`.  It prevents the default behavior (which is changing the hash) and
updates it's route data attribute with the select tab's id:

@codestart
can.route.attr(this.options.attr, this.tab(el)[0].id)
@codeend

`HistoryTabs` listens to these route changes with `"{can.route} {attr}"` and activates
the new tab.

__Configuring Routes__

The code ends by configuring the routes and creating the `HistoryTabs`.  Here's what each
route rule means:

@codestart
can.route(":component",{
  component: "model",
  person: "mihael"
});
@codeend

This matches the empty routes `("","#","#!")`, and a single "word" route.  If the route
is one of the empty routes, the route data will look 
like: `{component: "modal", person: "mihael"}`.  If it is a single "word" route like
`"#!view"`, the data will look like:  `{component: "view", person: "mihael"}`.

@codestart
can.route(":component/:person",{
  component: "model",
  person: "mihael"
});
@codeend

This matches two-word routes seperated by a slash ("/").  Each word can be empty. If both
words are empty "#!/", the data will look 
like: `{component: "model", person: "mihael"}`.  If the words are non-empty, that word
will replace the default value.

### Observe Backed Routes

This recipe shows how to have multiple widgets listening on 
overlapping parts of the route. The app lets the user select a type of issue, show issues for that type,
and select a issue and see details about that issue.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/2UL6R/1/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

#### How it works

This functionality is broken down 
into __Nav__, __Issues__, and __Details__ can.controls.  Here's how
each part works:

`Nav` creates links using `can.route.link` that update the hash like:

@codestart
&lt;%== can.route.link("Critical",{filter: "critical"}) %>
@codeend

When these are clicked on, they update the route's filter data.  

`Issues` listens to filter changes like:

@codestart
"{can.route} filter" : function(route, ev, filter){ ... }
@codeend

It then retrieve's issue with `Issue.findAll` and renders 
them into the `#issues` element.

When an issue is clicked, `Issues` updates the route's issue data like:

@codestart
can.route.attr("issue", issue.id)
@codeend

It listens to changes in `issue` data and highlights the corresponding
issue in the list like:

@codestart
"{can.route} issue" : function(route, ev, issue){ ... }
@codeend

`Details` listens to issue chagnes like:

@codestart
"{can.route} issue" : function(route, ev, issue){ ... }
@codeend

And updates the details panel.