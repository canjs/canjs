const Message = can.DefineMap.extend( {
	id: "number",
	name: "string",
	body: "string",
	created_at: "date"
} );
Message.List = can.DefineList.extend( {
	"#": Message
} );
Message.connection = can.connect.superMap( {
	url: {
		resource: "https://chat.donejs.com/api/messages",
		contentType: "application/x-www-form-urlencoded"
	},
	Map: Message,
	List: Message.List,
	name: "message"
} );
const ChatMessagesVM = can.DefineMap.extend( {
	messagesPromise: {
		default: function() {
			return Message.getList( {} );
		}
	},
	name: "string",
	body: "string",
	send: function( event ) {
		event.preventDefault();
		new Message( {
			name: this.name,
			body: this.body
		} ).save().then( function() {
			this.body = "";
		}.bind( this ) );
	}
} );
can.Component.extend( {
	tag: "chat-messages",
	ViewModel: ChatMessagesVM,
	view: can.stache.from( "chat-messages-template" )
} );
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
