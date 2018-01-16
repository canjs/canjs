var AppVM = can.DefineMap.extend({
	page: "string",
	message: {
		type: "string",
		default: "Chat Home",
		serialize: false
	},
	addExcitement: function(){
		this.message = this.message + "!";
	}
});

var appVM = new AppVM();

can.route.data = appVM;
can.route("{page}",{page: "home"});
can.route.start();

var template = can.stache.from('chat-template');
var frag = template(appVM);
document.body.appendChild(frag);
