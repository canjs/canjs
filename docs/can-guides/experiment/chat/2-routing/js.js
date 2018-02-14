const AppVM = can.DefineMap.extend( {
	page: "string",
	message: {
		type: "string",
		default: "Chat Home",
		serialize: false
	},
	addExcitement: function() {
		this.message = this.message + "!";
	}
} );
const appVM = new AppVM();
can.route.data = appVM;
can.route( "{page}", { page: "home" } );
can.route.start();
const template = can.stache.from( "chat-template" );
const frag = template( appVM );
document.body.appendChild( frag );
