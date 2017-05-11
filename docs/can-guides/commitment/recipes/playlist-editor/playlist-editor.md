@page guides/recipes/playlist-editor Playlist Editor (Advanced)
@parent guides/recipes

@description Learn how to use YouTube's API to search for videos and make a playlist.  This
makes authenticated requests with OAuth2.

@body


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
      'clientId': '599628366398-eg48d9isurrc7ji070lnog1tn0kvq5rc.apps.googleusercontent.com',
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

  CanJS can uses promises in its [can-stache] templates.  More on that below.

- A basic CanJS application is a live bound template (or view) rendered with a ViewModel.

- A [can-stache] template is used to render data into a document fragment:

  ```js
  var template = can.stache("<h1>{{message}}</h1>");
  var frag = template({message: "Hello World"});
  frag //-> <h1>Hello World</h1>
  ```

- Load a template from a `<script>` tag with [can.stache.from](http://canjs.com/doc/can-stache.from.html) like:

  ```js
  var template = can.stache.from(SCRIPT_ID);
  ```  

- Use [{{#if value}}](http://canjs.com/doc/can-stache.helpers.if.html) to do `if/else` branching in `can-stache`.
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

> Note: Please your own `clientId` if you use this code outside this guide.

@sourceref ./1-setup.html

Update the `JS` tab to:

@sourceref ./1-setup.js





## Sign in and out

### The problem

In this section, we will:

1. Show a `Sign In` button that signs a person into their google account.
2. Show a `Sign Out` button that signs are person out of their google account.
3. Automatically know via google's API when the user signs in and out and update the
   page.
4. Show a welcome message with the user's given name.

### What you need to know

- Once the Google API has been fully loaded, information about the
  current authenticated user can be found in the `googleAuth` object.  This
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

  > NOTE: EventStreams provide a much better way of doing this.  Checkout [can-define-stream-kefir].

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

In this section we will:

1. Create a search `<input>` where a user can type a search query.
2. When the user types more than 2 characters, get a list of video search results and display
   them to the user.

### What you need to know

- Use [can-stache-bindings.twoWay {($value)}] to setup a two-way binding in `can-stache`.  For example, the following keeps `searchQuery` and the input's `value` in sync:

   ```html
   <input  {($value)}="searchQuery"/>
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
	//         thumbnails: {default: {url: "http://..../dog.png"}}
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

- The [jQuery++](http://jquerypp.com/) library (which is already included on the page), supports
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
  wrapped with jQuery.  Add the `ghost` className to style the ghost elements like:

  ```js
  drag.ghost().addClass("ghost");
  ```

- To add a method to a `DefineMap` just add a function to one of the properties passed
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


### What you need to know

- jQuery++'s `drop` events and arguments.
  - dropover
  - dropout
  - dropon
- The `{{data}}` helper ... lets you associate data with an element.
- `drag.element`
- `can.data.get.call`
- Create an observable list - `can.DefineList`
- Derive the playlist items to be shown from the items added to the playlist
  and the current placeholder.

### The solution

Update the template in the `HTML` tab to:

@sourceref ./5-drop.html
@highlight 22-23,32-52,only

Update the `JS` tab to:

@sourceref ./5-drop.js
@highlight 50-89,only


## Drop videos in order ##
### The problem
Allow a user to add videos in the right place.

### What you need to know

- You can create custom events with `$().trigger()`
- Controls let you listen to events in a memory safe way, and translate them to other events.
- Can write up a control to a custom attribute.
- Dimensions and coordinates
  - $().height()
  - $().offset()
  - ev.pageY

### The solution

Update the template in the `HTML` tab to:

@sourceref ./6-order.html
@highlight 34-37,only

Update the `JS` tab to:

@sourceref ./6-order.js
@highlight 92-135,only




## Revert videos not dropped on playlist ##

### The problem

If a user drags a video but does not drop it on the playlist, show
an animation returning the video to its original place.

### What you need to know

- `drag.revert()`

### The solution

Update the `JS` tab to:

@sourceref ./7-revert.js
@highlight 93-95,100,103-107,only



## Create a playlist ##
### The problem

Add a `Create Playlist` button that saves the playlist.
Disable the button while the playlist is being created.

### What you need to know

- YouTube only allows you to create a playlist and then add items to it.
  - Create a playlist API.
  - Add an playlist item API.
- How to chain promises.
- Clean up other properties when the promise has finished.
- `{$attribute}="value()"`

### The solution

Update the template in the `HTML` tab to:

@sourceref ./8-create-playlist.html
@highlight 51-56,only

Update the `JS` tab to:

@sourceref ./8-create-playlist.js
@highlight 12-19,99-141,only
