const ChatMessagesVM = can.DefineMap.extend( {
} );
can.Component.extend( {
	tag: "chat-messages",
	ViewModel: ChatMessagesVM,
	view: can.stache.from( "chat-messages-template" )
} );
const AppVM = can.DefineMap.extend( {
	route: "string",
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
