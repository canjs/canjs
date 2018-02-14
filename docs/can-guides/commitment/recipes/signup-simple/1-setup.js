const AppViewModel = can.DefineMap.extend( {
} );
const viewModel = new AppViewModel( {} );
const view = can.stache.from( "app-view" );
const frag = view( viewModel );
document.body.appendChild( frag );
