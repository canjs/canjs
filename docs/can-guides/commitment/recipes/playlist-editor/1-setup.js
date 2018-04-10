const PlaylistVM = can.DefineMap.extend("PlaylistVM", {
  googleApiLoadedPromise: {
    default: googleApiLoadedPromise
  }
});

const vm = new PlaylistVM();
const template = can.stache.from("app-template");
const fragment = template(vm);
document.body.appendChild(fragment);
