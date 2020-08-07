@page guides/recipes/playlist-editor Playlist Editor
@parent guides/recipes/advanced

@description Learn how to use YouTube’s API to search for videos and make a playlist.  This
makes authenticated requests with OAuth2. It uses [https://jquerypp.com jQuery++] for
drag/drop events. It shows using custom attributes and custom events.  This advanced guide takes
an hour to complete.

> This recipe uses YouTube API Services and follows [YouTube Terms of Service](https://www.youtube.com/t/terms) 
> and [Google Privacy Policy](https://policies.google.com/privacy)

@body

The final widget looks like:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="result" data-user="bitovi" data-slug-hash="zYOaXwm" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Playlist Editor (Advanced) [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/zYOaXwm">
  Playlist Editor (Advanced) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

To use the widget:

1. _Click_ __Sign In__ to give access to the app to create playlists on your behalf.
2. _Type_ search terms in __Search for videos__ and hit _enter_.
3. _Drag_ and _drop_ those videos into the playlist area (__Drag video here__).
4. _Click_ __Create Playlist__.
5. _Enter_ a name in the popup.
6. _Navigate_ to your [YouTube](https://www.youtube.com/) channel to verify the playlist was created.

__START THIS TUTORIAL BY CLICKING THE “EDIT ON CODEPEN” BUTTON IN THE TOP RIGHT CORNER OF THE FOLLOWING EMBED:__:

<p class="codepen" data-height="144" data-theme-id="0" data-default-tab="result" data-user="bitovi" data-slug-hash="wZyLXb" style="height: 144px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Playlist Editor (Advanced) [Starter]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/wZyLXb/">
  Playlist Editor (Advanced) [Starter]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The following sections are broken down into:

- Problem — A description of what the section is trying to accomplish.
- What you need to know — Information about CanJS that is useful for solving the problem.
- Solution — The solution to the problem.

The following video goes through this recipe:

<iframe width="560" height="315" src="https://www.youtube.com/embed/0GLa33tdDTg" frameborder="0" allowfullscreen></iframe>

## Set up CanJS and Load Google API

### The problem

In this section, we will:

1. Load Google’s JS API client, `gapi`, and initialize it to make requests on behalf of
  the registered "CanJS Playlist" app.
2. Set up a basic CanJS application.
3. Use the basic CanJS application to show when Google’s JS API has finished loading.

### What you need to know

- The preferred way of loading Google’s JS API is with an `async` script tag like:

  ```html
  <script async defer src="https://apis.google.com/js/api.js"
    onload="this.onload=function(){}; googleScriptLoaded();"
    onreadystatechange="if (this.readyState === 'complete') this.onload();">
  </script>
  ```

  The `async` attribute allows other JS to execute while the `api.js` file is loading.
  Once complete, this will call a `googleScriptLoaded` function.

- Once `api.js` is loaded, it adds the [gapi](https://developers.google.com/api-client-library/javascript/reference/referencedocs)
  object to the window.  This is Google’s JS API.  It can be used to load other APIs that extend the `gapi` library.

  The following can be used to load the OAuth2 GAPI libraries:

  ```js
  gapi.load("client:auth2", completeCallback);
  ```

  Once this functionality is loaded, we can tell `gapi` to make requests on behalf of a registered
  application.  In this case, the following keys enable this client to make requests on behalf of the
  "CanJS Playlist" application:

  ```js
  gapi.client.init({
    apiKey: "AIzaSyAbHbOuFtJRvTX731PQXGSTy59eh5rEiE0",
    clientId: "764983721035-85cbj35n0kmkmrba10f4jtte8fhpst84.apps.googleusercontent.com",
    discoveryDocs: [ "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest" ],
    scope: "https://www.googleapis.com/auth/youtube"
  }).then( completeCallback )
  ```

  To use your own key, you can follow the instructions [here](https://developers.google.com/youtube/v3/getting-started). This is not required to complete this guide.

- Instead of callbacks, CanJS favors [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to manage
  asynchronous behavior. A promise can be created like:

  ```js
  const messagePromise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve("Hello There");
    }, 1000);
  });
  ```

  `resolve` should be called once the promise has a value.  `reject` should be called
  if something goes wrong (like an error).  We say the `messagePromise` _resolves_ with
  `"Hello There"` after one second.

  Anyone can listen to when `messagePromise` resolves with a value like:

  ```js
  messagePromise.then(function(messageValue) {
    messageValue //-> "Hello There"
  });
  ```

  CanJS can use promises in its [can-stache] templates.  More on that below.

- A basic CanJS application is a live-bound template (or view) rendered with the component’s [can-stache-element/static.props props].

  ```js
  import { StacheElement } from "can";

  class MyApp extends StacheElement {
    static view = `<h1>{{ message }}</h1>`;

    static props = {
      message: "Hello World"
    };
  }

  customElements.define("my-app", MyApp);
  ```

- Mount a [can-stache-element] by its custom tag like:

  ```html
  <my-app></my-app>
  ```  

- Use [can-stache.helpers.if {{# if(value) }}] to do `if/else` branching in [can-stache].
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are observable with [can-stache].  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{# if(somePromise.isPending) }}`.
  - Loop through the resolved value of the promise like: `{{# for(item of somePromise.value) }}`.


- [can-observable-object ObservableObject] can be used to define the behavior of observable objects like:

  ```js
  import { ObservableObject } from "can";

  class Type extends ObservableObject {
    static props = {
      message: String
    };
  }
  ```

- [can-stache-element/static.props] are [can-observable-object ObservableObject] like 
  properties used to control the behavior of a custom element.

  ```js
  import { StacheElement } from "can";

  class PlaylistEditor extends StacheElement {
    static view = `...`;
    static props = {
      message: String
    };
  }

  customElements.define("playlist-editor", PlaylistEditor);
  ```

- [can-observable-object ObservableObjec]s can specify a default value and a type:
  ```js
  import { StacheElement } from "can";

  class PlaylistEditor extends StacheElement {
    static view = `...`;
    static props = {
      message: { type: String, default: "Hello World" }
    };
  }

  customElements.define("playlist-editor", PlaylistEditor);
  ```


### The solution

Update the __HTML__ to:

> **Note:** use your own `clientId` if you use this code outside this guide and CodePen.

@sourceref ./1-setup.html
@highlight 1-24,only

Update the __JavaScript__ tab to:

@sourceref ./1-setup.js
@highlight 1-21,only





## Sign in and out

### The problem

In this section, we will:

1. Show a `Sign In` button that signs a person into their Google account.
2. Show a `Sign Out` button that signs a person out of their Google account.
3. Automatically know via Google’s API when the user signs in and out, and update the
   page accordingly.
4. Show a welcome message with the user’s given name.

### What you need to know

- Once the Google API has been fully loaded, information about the
  currently authenticated user can be found in the `googleAuth` object.  This
  can be retrieved like:

  ```js
  googleApiLoadedPromise.then(function() {
    const googleAuth = gapi.auth2.getAuthInstance()
  });
  ```

  With `googleAuth`, you can:

  - Know if someone is signed in: `googleAuth.isSignedIn.get()`
  - Sign someone in: `googleAuth.signIn()`
  - Sign someone out: `googleAuth.signOut()`
  - Listen to when someone’s signedIn status changes: `googleAuth.isSignedIn.listen(callback)`
  - Get the user’s name: `googleAuth.currentUser.get().getBasicProfile().getGivenName()`




- [ES5 getter syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) can
  be used to define a component property that changes when another property changes.  For example,
  the following defines an `signedOut` property that is the opposite of the `signedIn` property:

  ```js
  import { StacheElement } from "can";

  class PlaylistEditor extends StacheElement {
    static view = `...`;
    static props = {
      signedIn: Boolean,
      get signedOut() {
        return !this.signedIn;
      }
    };
  }

  customElements.define("playlist-editor", PlaylistEditor);
  ```

- Use [can-observable-object/define/async asynchronous getters] to get data from asynchronous sources.  For example:

  ```js
  import { StacheElement } from "can";

  class MyApp extends StacheElement {
    static view = `...`;
    static props = {
      property: {
        async(resolve) {
          apiLoadedPromise
            .then(function() {
              resolve(api.getValue());
            });
        }
      }
    };
  }
  
  customElements.define("my-app", MyApp);
  ```

- [can-stache-element] [can-stache-element/lifecycle-hooks.connected connected] hook can be used to perform initialization behavior.  For example, the following might initialize `googleApiLoadedPromise`:

  ```js
  import { StacheElement, type } from "can";

  class PlaylistEditor extends StacheElement {
    static view = `...`;
    static props = {
      googleApiLoadedPromise: type.Any,
    };
    connected() {
      this.googleApiLoadedPromise = googleApiLoadedPromise;
    }
  }

  customElements.define("playlist-editor", PlaylistEditor);
  ```

- [can-observable-object ObservableObject]’s [can-event-queue/map/map.listenTo] lets you listen on changes in a component. This can be used to change values when other values change.  The following will increment
`nameChange` everytime the `name` property changes:

  ```js
  import { StacheElement } from "can";

  class MyApp extends StacheElement {
    static view = `...`;
    static props = {
      name: String,
      nameChange: Number
    };
    connected() {
      this.listenTo("name", () => {
        this.nameChange += 1;
      });
    }
  }
  ```

  > **Note:** EventStreams provide a much better way of doing this.  Check out [can-define-stream-kefir].

- Use [can-stache-bindings.event on:EVENT] to listen to an event on an element and call a method in [can-stache].  For example, the following calls `sayHi()` when the `<div>` is clicked.

  ```html
  <div on:click="sayHi()"> <!-- ... --> </div>
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./2-signin.js
@highlight 8-12,23-41,44-51,only




## Search for videos ##

### The problem

In this section, we will:

1. Create a search `<input>` where a user can type a search query.
2. When the user types more than 2 characters, get a list of video search results and display
   them to the user.

### What you need to know

- Use [can-stache-bindings.twoWay value:bind] to setup a two-way binding in [can-stache].  For example, the following keeps `searchQuery` and the input’s `value` in sync:

   ```html
   <input value:bind="searchQuery">
   ```

- Use `gapi.client.youtube.search.list` to search YouTube like:

  ```js
  const googlePromise = gapi.client.youtube.search.list({
    q: "dogs",
    part: "snippet",
    type: "video"
  }).then(function(response) {
    response //-> {
             //     result: {
             //       items: [
             //         {
             //           id: {videoId: "ajsadfa"},
             //           snippet: {
             //             title: "dogs",
             //             thumbnails: {default: {url: "https://example.com/dog.png"}}
             //           }
             //         }
             //       ]
             //     }
             //   }
  });
  ```

- To convert a `googlePromise` to a native [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) use:

  ```js
  new Promise(function(resolve, reject) {
    googlePromise.then(resolve, reject);	  
  })
  ```


### The solution

Update the __JavaScript__ tab to:

@sourceref ./3-search.js
@highlight 14-33,64-79,only


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
  $(element).on("draginit", function(ev, drag) {
    drag.limit($(this).parent());
    drag.horizontal();
  });
  ```

  Notice that `drag` is the 2nd argument to the event.  You can listen to
  `drag` events in [can-stache] and pass the `drag` argument to a function like:

  ```html
  on:draginit="startedDrag(scope.arguments[1])"
  ```

- You can use [can-dom-events/helpers/add-jquery-events addJQueryEvents()]
  to listen to custom jQuery events (such as jQuery++’s `draginit` above):

  ```js
  import { addJQueryEvents } from "can";

  addJQueryEvents(jQuery);
  ```

- The `drag.ghost()` method copies the elements being dragged and drags that
  instead. The `.ghost()` method returns the copied elements
  wrapped with jQuery.  Add the `ghost` className to style the ghost elements, like:

  ```js
  drag.ghost().addClass("ghost");
  ```

- To add a method to a [can-stache-element], just add a function shown below:

  ```js
  import { StacheElement } from "can";

  class PlaylistEditor extends StacheElement {
    static view = `...`;
    static props = { ... };
    startedDrag() {
      console.log("you did it!")
    }
  }
  ```

- Certain browsers have default drag behaviors for certain elements like `<a>` and `<img>`
  that can be prevented with the `draggable="false"` attribute.

### The solution
Update the __JavaScript__ tab to:

@sourceref ./4-drag.js
@highlight 1,3,27-29,93-95,only


## Drop videos

### The problem

In this section, we will:

1. Allow a user to drop videos on a playlist element.
2. When the user drags a video over the playlist element, a placeholder of the
   video will appear in the first position of the playlist.
3. If the video is dragged out of the playlist element, the placeholder will be removed.
4. If the video is dropped on the playlist element, it will be added to the playlist’s
   list of videos.
5. Prepare for inserting the placeholder or video in any position in the list.

### What you need to know

- The `PlaylistEditor` element should maintain a list of playlist videos (`playlistVideos`) and
  the placeholder video (`dropPlaceholderData`) separately.  It can combine these
  two values into a single value (`videosWithDropPlaceholder`) of the videos to display to the
  user.  On a high-level, this might look like:

  ```js
  import { StacheElement, type, ObservableArray } from "can";

  class PlaylistEditor extends StacheElement {
    static view = `...`;
    static props = {
      // ...
      // { video: video, index: 0 }
      dropPlaceholderData: type.Any,

      // [video1, video2, ...]
      playlistVideos: {
        get default() {
          return new ObservableArray();
        }
      },

      get videosWithDropPlaceholder() {
        const copyOfPlaylistVideos = this.placeListVideos.map( /* ... */ );
        // insert this.dropPlaceholderData into copyOfPlaylistVideos
        return copyOfPlaylistVideos;
      }
    };
  }
  ```

- The methods that add a placeholder (`addDropPlaceholder`) and
  add video to the playlist (`addVideo`) should take an index like:

  ```js
  addDropPlaceholder(index, video) { /* ... */ }
  addVideo(index, video) { /* ... */ }
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
  $(element).on("dropon", (ev, drop, drag) => { /* ... */ });
  ```

  Notice that `drop` is now the 2nd argument to the event.  You can listen to
  `drop` events in [can-stache], and pass the `drag` argument to a function, like:

  ```html
  on:dropon="addVideo(scope.arguments[2])"
  ```

- You will need to associate the drag objects with the video being dragged so
  you know which video is being dropped when a `drop` happens. The following
  utilities help create that association:

  - The `drag.element` is the jQuery-wrapped element that the user initiated the
    drag motion upon.

  - CanJS’s [can-stache.helpers.domData {{ domData("DATANAME") }}] helper lets you
    associate custom data with an element. The following
    saves the current `context` of the `<li>` as `"dragData"` on the `<li>`:

    ```html
    <li on:draginit="this.videoDrag(scope.arguments[1])"
        {{domData("dragData")}}></li>
    ```

  - [can-dom-data.get domData.get()] can access this data like:

    ```js
    import { domData } from "can";

    domData.get(drag.element[0], "dragData");
    ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./5-drop.js
@highlight 33,43-63,119-133,149-171,only



## Drop videos in order ##
### The problem

In this section, we will:

1. Allow a user to drop videos in order they prefer.

### What you need to know

- [can-stache-elements StacheElement]s are best left knowing very little about the DOM. This
  makes them more easily unit-testable.  To make this interaction, we need to know where the 
  mouse is in relation to the playlist’s videos.  This requires a lot of DOM interaction
  and is best done outside the element.

  Specifically, we’d like to translate the `dropmove` and `dropon` events
  into other events that let people know where the `dropmove` and `dropon` events
  are happening in relationship to the __drop target__’s child elements.

  Our goal is to:

  - Translate `dropmove` into `sortableplaceholderat` events
    that dispatch events with the `index` where a placeholder should be inserted
    and the `dragData` of what is being dragged.

  - Translate `dropon` into `sortableinsertat` events
    that dispatch events with the `index` where the dragged item should be inserted
    and the `dragData` of what is being dragged.  

- [can-control Control] is useful for listening to events on an element in a memory-safe
  way.  Use [can-control.extend] to define a `Control` type, as follows:

  ```js
  import { Control } from "can";

  const Sortable = Control.extend({
    // Event handlers and methods
  });
  ```

  To listen to events (like `dragmove`) on a control, use an event handler with `{element} EVENTNAME`,
  as follows:

  ```js
  import { Control } from "can";

  const Sortable = Control.extend({
    "{element} dropmove": function(el, ev, drop, drag) {
      // do stuff on dropmove like call method:
      this.method();
    },
    method() {
      // do something
    }
  });
  ```

  Use `new Control(element)` to create a control on an element.  The following
  would setup the `dropmove` binding on `el`:

  ```js
  new Sortable(el);
  ```

- [can-view-callbacks.attr viewCallbacks.attr()] can listen to when a custom attribute is
  found in a [can-stache] template like:

  ```js
  import { viewCallbacks } from "can";

  viewCallbacks.attr("sortable", function(el, attrData) {});
  ```

  This can be useful to create controls on an element with that attribute.  For example, if a user has:

  ```html
  <ul sortable>
    <!-- ... -->
  </ul>
  ```

  The following will create the `Sortable` control on that `<ul>`:

  ```js
  import { viewCallbacks } from "can";

  viewCallbacks.attr("sortable", function(el) {
    new Sortable(el);
  });
  ```

- Use [can-dom-events.dispatch domEvents.dispatch()] to fire custom events:

  ```js
  import { domEvents } from "can";

  domEvents.dispatch(element, {
    type: "sortableinsertat",
    index: 0,
    dragData: dragData
  });
  ```

- Access the event object in a [can-stache-bindings.event] with [can-stache/keys/scope#scope_event scope.event], like:

  ```html
  on:sortableinsertat="addVideo(scope.event.index, scope.event.dragData)"
  ```

- Mouse events like `click` and `dropmove` and `dropon` have a `pageY` property that
  tells how many pixels down the page a user’s mouse is.
- [jQuery.offset](https://api.jquery.com/offset/) returns an element’s position on the page.
- [jQuery.height](https://api.jquery.com/height/) returns an element’s height.
- If the mouse position is below an element’s center, the placeholder should be inserted
  after the element.  If the mouse position is above an element’s center, it should be inserted
  before the element.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./6-order.js
@highlight 3,6,9,14-55,57-59,96-101,only




## Revert videos not dropped on playlist ##

### The problem

In this section, we will:

1. Revert videos not dropped on the playlist. If a user drags a video, but does not drop it on the playlist, show
  an animation returning the video to its original place.

### What you need to know

- If you call `drag.revert()`, the drag element will animate back to its original position.

### The solution

Update the __JavaScript__ tab to:

@sourceref ./7-revert.js
@highlight 15-17,22,25-28,only



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
  let lastPromise = gapi.client.youtube.playlists.insert({
    part: "snippet,status",
    resource: {
      snippet: {
        title: PLAYLIST_NAME,
        description: "A private playlist created with the YouTube API and CanJS"
      },
      status: {
        privacyStatus: "private"
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
    part: "snippet",
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

  lastPromise = lastPromise.then(function() {
    return makeRequest(2);	  
  });

  lastPromise = lastPromise.then(function() {
    return makeRequest(3);	  
  });
  ```

  When a callback to `.then` returns a promise, `.then` returns a promise that resolves
  after the _inner_ promise has been resolved.

- Use [can-stache-bindings.toChild {disabled:from="boolean"}] to make an input disabled, like:

  ```html
  <button disabled:from="createPlaylistPromise.isPending()">
  ```

- When the promise has finished, set the `playlistVideos` property back to an empty list. This
  can be done by listening to `createPlaylistPromise`:

  ```js
  this.listenTo("createPlaylistPromise", function({ value: promise }) { /* ... */ })
  ```

### The solution

Update the __JavaScript__ tab to:

@sourceref ./8-create-playlist.js
@highlight 122-129,164,216-223,254-296,only

## Result

Congrats! _You now have your very own YouTube Playlist Editor_.

When finished, you should see something like the following CodePen:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="result" data-user="bitovi" data-slug-hash="zYOaXwm" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Playlist Editor (Advanced) [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/zYOaXwm">
  Playlist Editor (Advanced) [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
