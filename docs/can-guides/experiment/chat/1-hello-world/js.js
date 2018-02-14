const AppVM = can.DefineMap.extend( {
	message: {
		type: "string",
		default: "Chat Home"
	},
	addExcitement: function() {
		this.message = this.message + "!";
	}
} );
const appVM = new AppVM();
const template = can.stache.from( "chat-template" );
const frag = template( appVM );
document.body.appendChild( frag );
