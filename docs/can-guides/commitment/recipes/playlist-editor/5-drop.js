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

const vm = new PlaylistVM();
const template = can.stache.from("app-template");
const fragment = template(vm);
document.body.appendChild(fragment);
