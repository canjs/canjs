@page guides/recipes/playlist-editor Playlist Editor (Advanced)
@parent guides/recipes

@description Learn how to use YouTube's API to search for videos and make a playlist.  This
makes authenticated requests with OAuth2.

@body


## Setup CanJS and Load Google API

Setup a basic CanJS application.  Load Google's JS API client.

### The problem
### What you need to know

- Google API
- Promises
- CanJS Basic setup
  - DefineMap
    - `value`
  - Stache templates
    - `#if`
	- observable promises


### The solution

@sourceref ./1-setup.html

@sourceref ./1-setup.js





## Sign in and out

### The problem

Show a `Sign In` button that signs a person into their google account.
Show a `Sign Out` button that signs are person out of their google account.
Automatically know via google's API when the user signs in and out and update the
UI.

### What you need to know

- How to get `googleAuth` which lets you sign in and out.
- How to listen to if someone's "signedIn" status changes.
- How to sign in and out with `googleAuth`.
- How to get the auth user's name.

- How to do an async getter.
- How to listen to changes in a map (in init).
- How to define a simple property ()

### The solution

@sourceref ./2-signin.html
@highlight 5-9,only

@sourceref ./2-signin.js
@highlight 2-11,15-26,only




## Search for videos ##

### The problem

Let a user type into an an input.  When the input changes value,
use YouTube's `search` api to query matching videos and present them to the user.

### What you need to know

- How to query YouTube's search API.
- How to convert YouTube's promises into native Promises.
- A getter that derives values.

### The solution

@sourceref ./3-search.html
@highlight 11-31,only

@sourceref ./3-search.js
@highlight 27-46,only


## Drag videos ##

### The problem

Let a user drag around the videos.

### What you need to know

- jQuery++'s `drag` events and arguments.
- `ghost()`
- Make sure it has a special className.

### The solution

@sourceref ./4-drag.html
@highlight 22,only

@sourceref ./4-drag.js
@highlight 47-49,only


## Drop videos
### The problem

- Allow the user to drop videos on a playlist element.

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

@sourceref ./5-drop.html
@highlight 22-23,32-52,only

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
- `drag.revert()`

### The solution

@sourceref ./6-order.html
@highlight 34-37,only

@sourceref ./6-order.js
@highlight 92-144,only



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


@sourceref ./7-create-playlist.html
@highlight 51-56,only

@sourceref ./7-create-playlist.js
@highlight 12-19,99-141,only
