var Message = can.DefineMap.extend({
	id: "number",
	name: "string",
	body: "string",
	created_at: "date"
});

Message.List = can.DefineList.extend({
	"#": Message
});

Message.connection = can.connect.superMap({
	url: {
		resource: 'http://chat.donejs.com/api/messages',
		contentType: 'application/x-www-form-urlencoded'
	},
	Map: Message,
	List: Message.List,
	name: 'message'
});

var socket = io('http://chat.donejs.com');

socket.on('messages created', function(message){
	Message.connection.createInstance(message);
});
socket.on('messages updated', function(message){
	Message.connection.updateInstance(message);
});
socket.on('messages removed', function(message){
	Message.connection.destroyInstance(message);
});

var ChatMessagesVM = can.DefineMap.extend({
	messagesPromise: {
		value: function(){
			return Message.getList({});
		}
	},
	name: "string",
	body: "string",
	send: function(event) {
	    event.preventDefault();

		new Message({
			name: this.name,
			body: this.body
		}).save().then(function(){
			this.body = "";
		}.bind(this));
	}
});

can.Component.extend({
	tag: "chat-messages",
	ViewModel: ChatMessagesVM,
	view: can.stache.from("chat-messages-template")
});

var AppVM = can.DefineMap.extend({
    page: "string",
	message: {
      type: "string",
      value: "Chat Home",
      serialize: false
    },
	addExcitement: function(){
		this.message = this.message + "!";
	}
});

var appVM = new AppVM();

can.route.data = appVM;
can.route(":page",{page: "home"});
can.route.ready();

var template = can.stache.from('chat-template');
var frag = template(appVM);
document.body.appendChild(frag);
