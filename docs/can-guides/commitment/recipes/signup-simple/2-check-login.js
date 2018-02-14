const AppViewModel = can.DefineMap.extend( {
	sessionPromise: {
		default: function() {
			return can.ajax( {
				url: "/api/session"
			} );
		}
	}
} );
const viewModel = new AppViewModel( {} );
const view = can.stache.from( "app-view" );
const frag = view( viewModel );
document.body.appendChild( frag );
