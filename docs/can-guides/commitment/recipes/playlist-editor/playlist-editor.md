@page guides/recipes/playlist-editor Playlist Editor (Advanced)
@parent guides/recipes

@description Learn how to use YouTube's API to search for videos and make a playlist.  This
makes authenticated requests with OAuth2. It uses [jQuery++](https://jquerypp.com) for
drag/drop events. It shows using custom attributes and custom events.  This guide takes
an hour to complete.

@body

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/xiponom/12/embed?output">JS Bin on jsbin.com</a>

To use the widget:

1. _Click_ __Sign In__ to give access to the app to create playlists on your behalf.
2. _Type_ search terms in __Search for videos__ and hit _enter_.
3. _Drag_ and _drop_ those videos into the playlist area (__Drag video here__).
4. _Click_ __Create Playlist__.
5. _Enter_ a name in the popup.
6. _Navigate_ to your [YouTube](https://www.youtube.com/) channel to verify the playlist was created.

__Start this tutorial by cloning the following JSBin__:

<a class="jsbin-embed" href="https://jsbin.com/ducabam/2/embed?html,output">JS Bin on jsbin.com</a>

This JSBin has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- Problem — A description of what the section is trying to accomplish.
- Things to know — Information about CanJS that is useful for solving the problem.
- Solution — The solution to the problem.

## Setup CanJS and Load Google API

### The problem

In this section, we will:

1. Load Google's JS API client, `gapi`, and initialize it to make requests on behalf of
   the registered "CanJS Playlist" app.
2. Setup a basic CanJS application.
3. Use the basic CanJS application to show when Google's JS API has finished loading.

### What you need to know

- The preferred way of loading Google's JS API is with an `async` script tag like:

  ```html
  <script async defer src="https://apis.google.com/js/api.js"
    onload="this.onload=function(){}; googleScriptLoaded();"
    onreadystatechange="if (this.readyState === 'complete') this.onload();">
  </script>
  ```

  The `async` attribute allows other JS to execute while the `api.js` file is loading.
  Once complete, this will call a `googleScriptLoaded` function.

- Once `api.js` is loaded, it adds the   [gapi](https://developers.google.com/api-client-library/javascript/reference/referencedocs)
  object to the window.  This is Google's JS API.  It can be used to load other APIs that extend the `gapi` library.

  The following can be used to load the OAuth2 GAPI libraries:

  ```js
  gapi.load('client:auth2', completeCallback);
  ```

  Once this functionality is loaded, we can tell `gapi` to make requests on behalf of a registered
  application.  In this case, the following keys enable this client to make requests on behalf of the
  "CanJS Playlist" application:

  ```js
  gapi.client.init({
	  'apiKey': 'AIzaSyAbHbOuFtJRvTX731PQXGSTy59eh5rEiE0',
      'clientId': '764983721035-85cbj35n0kmkmrba10f4jtte8fhpst84.apps.googleusercontent.com',
      'discoveryDocs': [ 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest' ],
      'scope': 'https://www.googleapis.com/auth/youtube'
  }).then( completeCallback )
  ```

  To use your own key, you can follow the instructions [here](https://developers.google.com/youtube/v3/getting-started). This is not required to complete this guide.

- Instead of callbacks, CanJS favors [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to manage
  asynchronous behavior. A promise can be created like:

  ```js
  var messagePromise = new Promise(function(resolve, reject){
    setTimeout(function(){
		resolve("Hello There")
	},1000)
  });
  ```

  `resolve` should be called once the promise has a value.  `reject` should be called
  if something goes wrong (like an error).  We say the `messagePromise` _resolves_ with
  `"Hello There"` after one second.

  Anyone can listen to when `messagePromise` resolves with a value like:

  ```js
  messagePromise.then(function(messageValue){
	  messageValue //-> "Hello There"
  });
  ```

  CanJS can use promises in its [can-stache] templates.  More on that below.

- A basic CanJS application is a live-bound template (or view) rendered with a ViewModel.

- A [can-stache] template is used to render data into a document fragment:

  ```js
  var template = can.stache("<h1>{{message}}</h1>");
  var frag = template({message: "Hello World"});
  frag //-> <h1>Hello World</h1>
  ```

- Load a template from a `<script>` tag with [can-stach.from can.stache.from] like:

  ```js
  var template = can.stache.from(SCRIPT_ID);
  ```  

- Use [can-stache.helpers.if {{#if value}}] to do `if/else` branching in `can-stache`.
- `Promise`s are observable in `can-stache`.  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{#if somePromise.isPending}}`.
  - Loop through the resolved value of the promise like: `{{#each somePromise.value}}`.


- [can-define/map/map can.DefineMap] can be used to define the behavior of observable objects like:

  ```js
  var Type = can.DefineMap.extend({
	  message: "string"
  });
  ```

- Instances of these [can-define/map/map can.DefineMap] types are often used
  as a ViewModel that controls the behavior of a [can-stache] template (or
  [can-component]).

  ```js
  var PlaylistVM = can.DefineMap.extend({
	  message: "string"
  });

  var messageVM = new PlaylistVM();
  var frag = template(messageVM)
  ```

- `can.DefineMap` can specify a default value and a type:
  ```js
  var PlaylistVM = can.DefineMap.extend({
    count: {value: 33}
  });
  new PlaylistVM().count //-> 33
  ```


### The solution

Update the `HTML` tab to:

> Note: Please use your own `clientId` if you use this code outside this guide.

@sourceref ./1-setup.html

Update the `JS` tab to:

@sourceref ./1-setup.js





## Sign in and out

### The problem

In this section, we will:

1. Show a `Sign In` button that signs a person into their google account.
2. Show a `Sign Out` button that signs a person out of their google account.
3. Automatically know via google's API when the user signs in and out, and update the
   page accordingly.
4. Show a welcome message with the user's given name.

### What you need to know

- Once the Google API has been fully loaded, information about the
  currently authenticated user can be found in the `googleAuth` object.  This
  can be retrieved like:

  ```js
  googleApiLoadedPromise.then(function(){
	  var googleAuth = gapi.auth2.getAuthInstance()
  });
  ```

  With `googleAuth`, you can:

  - Know if someone is signed in: `googleAuth.isSignedIn.get()`
  - Sign someone in: `googleAuth.signIn()`
  - Sign someone out: `googleAuth.signOut()`
  - Listen to when someone's signedIn status changes: `googleAuth.isSignedIn.listen(callback)`
  - Get the user's name: `googleAuth.currentUser.get().getBasicProfile().getGivenName()`




- [ES5 Getter Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can
  be used to define a `DefineMap` property that changes when another property changes.  For example,
  the following defines an `signedOut` property that is the opposite of the `signedIn` property:

  ```js
  DefineMap.extend({
    signedIn: "boolean",
    get signedOut(){
      return !this.signedIn;
    }
  });
  ```

- Use [can-define.types.get asynchronous getters] to get data from asynchronous sources.  For example:

  ```js
  var PlaylistVM = can.DefineMap.extend({
    property: {
      get: function(lastSet, resolve) {
        apiLoadedPromise.then(function(){
			resolve( api.getValue() );
		})
      }
    }
  });
  ```

- DefineMap's `init` method can be used to perform initialization behavior.  For example,
  the following might initialize `googleApiLoadedPromise`:

  ```js
  DefineMap.extend({
	  init: function(){
		  this.googleApiLoadedPromise = googleApiLoadedPromise;
	  },
	  googleApiLoadedPromise: "any"
  })
  ```

- `DefineMap`'s on [can-define/map/map.prototype.on] lets you listen on changes in a DefineMap.
  This can be used to change values when other values change.  The following will increment
  `nameChange` everytime the `name` property changes:

  ```js
  DefineMap.extend({
	  init: function(){
		  var self = this;
		  self.on("name", function(){
		      self.nameChange++;	  
		  })
	  },
	  name: "string",
	  nameChange: "number"
  })
  ```

  > NOTE: EventStreams provide a much better way of doing this.  Check out [can-define-stream-kefir].

- Use [can-stache-bindings.event ($EVENT)] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `sayHi()` when the `<div>` is clicked.

   ```html
   <div ($click)="sayHi()"> … </div>
   ```

### The solution

Update the template in the `HTML` tab to:

@sourceref ./2-signin.html
@highlight 5-9,only

Update the `JS` tab to:

@sourceref ./2-signin.js
@highlight 2-11,15-26,only




## Search for videos ##

### The problem

In this section, we will:

1. Create a search `<input>` where a user can type a search query.
2. When the user types more than 2 characters, get a list of video search results and display
   them to the user.

### What you need to know

- Use [can-stache-bindings.twoWay {($value)}] to setup a two-way binding in `can-stache`.  For example, the following keeps `searchQuery` and the input's `value` in sync:

   ```html
   <input {($value)}="searchQuery"/>
   ```

- Use `gapi.client.youtube.search.list` to search YouTube like:

  ```js
  var googlePromise = gapi.client.youtube.search.list({
    q: "dogs",
    part: 'snippet',
    type: 'video'
  }).then(function(response){
    response //-> {
	// result: {
	//   items: [
	//     {
	//       id: {videoId: "ajsadfa"},
	//       snippet: {
	//         title: "dogs",
	//         thumbnails: {default: {url: "https://example.com/dog.png"}}
	//       }
	//     }
	//   ]
	// }	 
	//}
  });
  ```

- To convert a `googlePromise` to a native `Promise` use:

  ```js
  new Promise(function(resolve, reject){
    googlePromise.then(resolve, reject);	  
  })
  ```


### The solution

Update the template in the `HTML` tab to:

@sourceref ./3-search.html
@highlight 11-31,only

Update the `JS` tab to:

@sourceref ./3-search.js
@highlight 27-46,only


## Drag videos ##

### The problem

In this section, we will:

1. Let a user drag around a cloned representation of the searched videos.

### What you need to know

- The [jQuery++](https://jquerypp.com/) library (which is already included on the page), supports
  the following `drag` events:

  - `dragdown` - the mouse cursor is pressed down
  - `draginit` - the drag motion is started
  - `dragmove` - the drag is moved
  - `dragend` - the drag has ended
  - `dragover` - the drag is over a drop point
  - `dragout` - the drag moved out of a drop point

  You can bind on them manually with jQuery like:

  ```js
  $(element).on('draginit', function(ev, drag) {
    drag.limit($(this).parent());
    drag.horizontal();
  });
  ```

  Notice that `drag` is the 2nd argument to the event.  You can listen to
  `drag` events in [can-stache] and pass the `drag` argument to a function like:

  ```html
  ($draginit)="startedDrag(%arguments[1])"
  ```

- The `drag.ghost()` method copies the elements being dragged and drags that
  instead. The `.ghost()` method returns the copied elements
  wrapped with jQuery.  Add the `ghost` className to style the ghost elements, like:

  ```js
  drag.ghost().addClass("ghost");
  ```

- To add a method to a `DefineMap`, just add a function to one of the properties passed
  to extend:

  ```js
  PlaylistVM = DefineMap.extend({
	startedDrag: function(){
	  console.log("you did it!")
	}
  });
  new PlaylistVM().startedDrag();
  ```

### The solution

Update the template in the `HTML` tab to:

@sourceref ./4-drag.html
@highlight 22,only

Update the `JS` tab to:

@sourceref ./4-drag.js
@highlight 47-49,only


## Drop videos
### The problem

In this section, we will:

1. Allow a user to drop videos on a playlist element.
2. When the user drags a video over the playlist element, a placeholder of the
   video will appear in the first position of the playlist.
3. If the video is dragged out of the playlist element, the placeholder will be removed.
4. If the video is dropped on the playlist element, it will be added to the playlist's
   list of videos.
5. Prepare for inserting the placeholder or video in any position in the list.

### What you need to know

- The `PlaylistVM` should maintain a list of playlist videos (`playlistVideos`) and
  the placeholder video (`dropPlaceholderData`) separately.  It can combine these
  two values into a single value (`videosWithDropPlaceholder`) of the videos to display to the
  user.  On a high-level, this might look like:

  ```js
  PlaylistVM = DefineMap.extend({
      ...
      // {video: video, index: 0}
	  dropPlaceholderData: "any",
	  // [video1, video2, ...]
	  playlistVideos: {
	     Type: ["any"],
	     Value: can.DefineList
	  },
	  get videosWithDropPlaceholder() {
         var copyOfPlaylistVideos = this.placeListVideos.map(...);

         // insert this.dropPlaceholderData into copyOfPlaylistVideos

		 return copyOfPlaylistVideos;
	  }
  })
  ```

- The methods that add a placeholder (`addDropPlaceholder`) and
  add video to the playlist (`addVideo`) should take an index like:

  ```js
  addDropPlaceholder: function(index, video) { ... }
  addVideo: function(index, video) { ... }
  ```

  These functions will be called with `0` as the index for this section.  

- jQuery++ supports the following [drop](https://jquerypp.com/#drop) events:

  - dropinit - the drag motion is started, drop positions are calculated
  - dropover - a drag moves over a drop element, called once as the drop is dragged over the element
  - dropout - a drag moves out of the drop element
  - dropmove - a drag is moved over a drop element, called repeatedly as the element is moved
  - dropon - a drag is released over a drop element
  - dropend - the drag motion has completed

  You can bind on them manually with jQuery like:

  ```js
  $(element).on('dropon', function(ev, drop, drag) {...});
  ```

  Notice that `drop` is now the 2nd argument to the event.  You can listen to
  `drop` events in [can-stache], and pass the `drag` argument to a function, like:

  ```html
  ($dropon)="addVideo(%arguments[2])"
  ```

- You will need to associate the drag objects with the video being dragged so
  you know which video is being dropped when a `drop` happens. The following
  utilities help create that association:

  - The `drag.element` is the jQuery-wrapped element that the user initiated the
    drag motion upon.

  - CanJS's `{{data DATANAME}}` helper lets you associate custom data with an element. The following
    saves the current `context` of the `<li>` as `"dragData"` on the `<li>`:

    ```
    <li ($draginit)="videoDrag(%arguments[1])"
              {{data "dragData"}}>
    ```

  - [can-util/dom/data/data.get can.data.get] can access this data like:

    ```js
    can.data.get.call(drag.element[0], "dragData");
    ```

### The solution

Update the template in the `HTML` tab to:

@sourceref ./5-drop.html
@highlight 22-23,32-52,only

Update the `JS` tab to:

@sourceref ./5-drop.js
@highlight 50-89,only



## Drop videos in order ##
### The problem

In this section, we will:

1. Allow a user to drop videos in order they prefer.

### What you need to know

- ViewModels are best left knowing very little about the DOM. This makes them more
  easily unit-testable.  To make this interaction, we need to know where the mouse
  is in relation to the playlist's videos.  This requires a lot of DOM interaction
  and is best done outside the ViewModel.

  Specifically, we'd like to translate the `dropmove` and `dropon` events
  into other events that let people know where the `dropmove` and `dropon` events
  are happening in relationship to the __drop target__'s child elements.

  Our goal is to:

  - Translate `dropmove` into `sortableplaceholderat` events
    that dispatch events with the `index` where a placeholder should be inserted
    and the `dragData` of what is being dragged.

  - Translate `dropon` into `sortableinsertat` events
    that dispatch events with the `index` where the dragged item should be inserted
    and the `dragData` of what is being dragged.  

- [can-control can.Control] is useful for listening to events on an element in a memory-safe
  way.  Use [can-control.extend] to define a `can.Control` type, as follows:

  ```js
  var Sortable = can.Control.extend({
	  ... event handlers and methods ...
  });
  ```

  To listen to events (like `dragmove`) on a control, use an event handler with `{element} EVENTNAME`,
  as follows:

  ```js
  var Sortable = can.Control.extend({
	"{element} dropmove": function(el, ev, drop, drag) {
      // do stuff on dropmove like call method:
      this.method();
    },
	method: function(){
	  // do something
	}
  });
  ```

  Use `new Control(element)` to create a control on an element.  The following
  would setup the `dropmove` binding on `el`:

  ```js
  new Sortable(el);
  ```

- [can-view-callbacks.attr can.view.callbacks.attr] can listen to when a custom attribute is
  found in a [can-stache] template like:

  ```js
  can.view.callbacks.attr("sortable", function(el, attrData) {});
  ```

  This can be useful to create controls on an element with that attribute.  For example, if a user has:

  ```html
  <ul sortable>...</ul>
  ```

  The following will create the `Sortable` control on that `<ul>`:

  ```js
  can.view.callbacks.attr("sortable", function(el) {
    new Sortable(el);
  });
  ```

- Use [$.trigger](https://api.jquery.com/trigger/) to fire custom events with jQuery:

  ```js
  $(element).trigger({
    type: "sortableinsertat",
    index: 0,
    dragData: dragData
  });
  ```

- Access the event object in a [can-stache-bindings.event] with `%event`, like:

  ```html
  ($sortableinsertat)="addVideo(%event.index, %event.dragData)"
  ```

- Mouse events like `click` and `dropmove` and `dropon` have a `pageY` property that
  tells how many pixels down the page a user's mouse is.
- [jQuery.offset](https://api.jquery.com/offset/) returns an element's position on the page.
- [jQuery.height](https://api.jquery.com/height/) returns an element's height.
- If the mouse position is below an element's center, the placeholder should be inserted
  after the element.  If the mouse position is above an element's center, it should be inserted
  before the element.

### The solution

Update the template in the `HTML` tab to:

@sourceref ./6-order.html
@highlight 34-37,only

Update the `JS` tab to:

@sourceref ./6-order.js
@highlight 92-135,only




## Revert videos not dropped on playlist ##

### The problem

In this section, we will:

1. Revert videos not dropped on the playlist. If a user drags a video, but does not drop it on the playlist, show
  an animation returning the video to its original place.

### What you need to know

- If you call `drag.revert()`, the drag element will animate back to its original position.

### The solution

Update the `JS` tab to:

@sourceref ./7-revert.js
@highlight 93-95,100,103-107,only



## Create a playlist ##
### The problem

In this section, we will:

1. Add a `Create Playlist` button that prompts the user for the playlist name.
2. After the user enters the name, the playlist is saved.
3. Disable the button while the playlist is being created.
4. Empty the playlist after it is created.

### What you need to know

- Use [https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt] to prompt a user for a simple string value.

- YouTube _only_ allows you to create a playlist and add items to it.

  To create a playlist:

  ```js
  var lastPromise = gapi.client.youtube.playlists.insert({
	part: 'snippet,status',
	resource: {
	  snippet: {
		title: PLAYLIST_NAME,
		description: 'A private playlist created with the YouTube API and CanJS'
	  },
	  status: {
		privacyStatus: 'private'
	  }
	}
  }).then(function(response) {
	response //->{} response.result.id
	// result: {
	//   id: "lk2asf8o"
	// }
  });
  ```

  To insert something onto the end of it:

  ```js
  gapi.client.youtube.playlistItems.insert({
    part: 'snippet',
    resource: {
      snippet: {
        playlistId: playlistId,
        resourceId: video.id
      }
    }
  }).then();
  ```

- These requests must run in order.  You can make one request run after another, like:

  ```js
  lastPromise = makeRequest(1);

  lastPromise = lastPromise.then(function(){
    return makeRequest(2);	  
  })

  lastPromise = lastPromise.then(function(){
    return makeRequest(3);	  
  })
  ```

  When a callback to `.then` returns a promise, `.then` returns a promise that resolves
  after the _inner_ promise has been resolved.

- Use [can-stache-bindings.toChild {$disabled}] to make an input disabled, like:

  ```html
  <button {$disabled}="createPlaylistPromise.isPending()">...
  ```

- When the promise has finished, set the `playlistVideos` property back to an empty list. This
  can be done by listening to `createPlaylistPromise`:

  ```js
  this.on("createPlaylistPromise", function(ev, promise) { ... })
  ```

### The solution

Update the template in the `HTML` tab to:

@sourceref ./8-create-playlist.html
@highlight 51-56,only

Update the `JS` tab to:

@sourceref ./8-create-playlist.js
@highlight 12-19,99-141,only

Congrats! _You now have your very own YouTube Playlist Editor_.

<script src="//static.jsbin.com/js/embed.min.js?3.41.6"></script>
