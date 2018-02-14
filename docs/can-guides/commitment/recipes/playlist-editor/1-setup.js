const PlaylistVM = can.DefineMap.extend( "PlaylistVM", {
	googleApiLoadedPromise: {
		default: googleApiLoadedPromise
	}
} );
const vm = new PlaylistVM();
const template = can.stache.from( "app-template" );
const frag = template( vm );
document.body.appendChild( frag );
