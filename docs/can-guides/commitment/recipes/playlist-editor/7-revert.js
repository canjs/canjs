const PlaylistVM = can.DefineMap.extend("PlaylistVM", {
  init: function() {
    const self = this;

    self.on("googleAuth", function(ev, googleAuth) {
      self.signedIn = googleAuth.isSignedIn.get();
      googleAuth.isSignedIn.listen(function(isSignedIn) {
        self.signedIn = isSignedIn;
      });
    });
  },
  googleApiLoadedPromise: {
    default: googleApiLoadedPromise
  },
  googleAuth: {
    get: function(lastSet, resolve) {
      this.googleApiLoadedPromise.then(function() {
        resolve(gapi.auth2.getAuthInstance());
      });
    }
  },
  signedIn: "boolean",
  get givenName() {
    return this.googleAuth &&
      this.googleAuth.currentUser.get().getBasicProfile().getGivenName();
  },
  searchQuery: {
    type: "string",
    default: ""
  },
  get searchResultsPromise() {
    if (this.searchQuery.length > 2) {

      const results = gapi.client.youtube.search.list({
        q: this.searchQuery,
        part: "snippet",
        type: "video"
      }).then(function(response) {
        console.info("Search results:", response.result.items);
        return response.result.items;
      });
      return new Promise(function(resolve, reject) {
        results.then(resolve, reject);
      });
    }
  },
  videoDrag: function(drag) {
    drag.ghost().addClass("ghost");
  },
  getDragData: function(drag) {
    return can.domData.get(drag.element[0], "dragData");
  },
  dropPlaceholderData: "any",
  playlistVideos: {
    Type: ["any"],
    Default: can.DefineList
  },
  addDropPlaceholder: function(index, video) {
    this.dropPlaceholderData = {
      index: index,
      video: video
    };
  },
  clearDropPlaceholder: function() {
    this.dropPlaceholderData = null;
  },
  addVideo: function(index, video) {
    this.dropPlaceholderData = null;
    if (index >= this.playlistVideos.length) {
      this.playlistVideos.push(video);
    } else {
      this.playlistVideos.splice(index, 0, video);
    }
  },
  get videosWithDropPlaceholder() {
    const copy = this.playlistVideos.map(function(video) {
      return {
        video: video,
        isPlaceholder: false
      };
    });
    if (this.dropPlaceholderData) {
      copy.splice(this.dropPlaceholderData.index, 0, {
        video: this.dropPlaceholderData.video,
        isPlaceholder: true
      });
    }
    return copy;
  }
});

can.addJQueryEvents(jQuery);

const Sortable = can.Control.extend({
  "{element} dropinit": function() {
    this.droppedOn = false;
  },
  "{element} dropmove": function(el, ev, drop, drag) {
    this.fireEventForDropPosition(ev, drop, drag, "sortableplaceholderat");
  },
  "{element} dropon": function(el, ev, drop, drag) {
    this.droppedOn = true;
    this.fireEventForDropPosition(ev, drop, drag, "sortableinsertat");
  },
  "{element} dropend": function(el, ev, drop, drag) {
    if (!this.droppedOn) {
      drag.revert();
    }
  },
  fireEventForDropPosition: function(ev, drop, drag, eventName) {
    const dragData = can.domData.get(drag.element[0], "dragData");

    const sortables = $(this.element).children();

    for (var i = 0; i < sortables.length; i++) {
      //check if cursor is past 1/2 way
      const sortable = $(sortables[i]);
      if (ev.pageY < Math.floor(sortable.offset().top + sortable.height() / 2)) {
        // index at which it needs to be inserted before
        can.domEvents.dispatch(this.element, {
          type: eventName,
          index: i,
          dragData: dragData
        });
        return;
      }
    }
    if (!sortables.length) {
      can.domEvents.dispatch(this.element, {
        type: eventName,
        index: 0,
        dragData: dragData
      });
    } else {
      can.domEvents.dispatch(this.element, {
        type: eventName,
        index: i,
        dragData: dragData
      });
    }
  }
});

can.view.callbacks.attr("sortable", function(el) {
  new Sortable(el);
});

const vm = new PlaylistVM();
const template = can.stache.from("app-template");
const fragment = template(vm);
document.body.appendChild(fragment);
