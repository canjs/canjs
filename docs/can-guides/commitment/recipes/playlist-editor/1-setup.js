var PlaylistVM = can.DefineMap.extend("PlaylistVM", {
  googleApiLoadedPromise: {
    default: googleApiLoadedPromise
  }
});

var vm = new PlaylistVM();
var template = can.stache.from("app-template");
var fragment = template(vm);
document.body.appendChild(fragment);
