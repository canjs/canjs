var PlaylistVM = can.DefineMap.extend("PlaylistVM", {
  googleApiLoadedPromise: {
    value: googleApiLoadedPromise
  }
});

var vm = new PlaylistVM();
var template = can.stache.from("app-template");
var frag = template(vm);
document.body.appendChild(frag);
