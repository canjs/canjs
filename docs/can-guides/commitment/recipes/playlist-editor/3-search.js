var PlaylistVM = can.DefineMap.extend("PlaylistVM", {
  init: function() {
    var self = this;

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

      var results = gapi.client.youtube.search.list({
          q: this.searchQuery,
          part: 'snippet',
          type: 'video'
        }).then(function(response){
        console.log(response.result.items);
        return response.result.items;
      });
      return new Promise(function(resolve, reject){
        results.then(resolve, reject);
      });
    }
  }
});

var vm = new PlaylistVM();
var template = can.stache.from("app-template");
var fragment = template(vm);
document.body.appendChild(fragment);
