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
  }
});

const vm = new PlaylistVM();
const template = can.stache.from("app-template");
const fragment = template(vm);
document.body.appendChild(fragment);
