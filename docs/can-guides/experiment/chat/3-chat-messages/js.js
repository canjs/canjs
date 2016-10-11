var ChatMessagesVM = can.DefineMap.extend({

});

can.Component.extend({
	tag: "chat-messages",
	ViewModel: ChatMessagesVM,
	view: can.stache.from("chat-messages-template")
});

var AppVM = can.DefineMap.extend({
    route: "string",
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
