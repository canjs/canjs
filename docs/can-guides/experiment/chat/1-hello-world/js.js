var AppVM = can.DefineMap.extend({
	message: {
		type: "string",
		default: "Chat Home"
	},
	addExcitement: function(){
		this.message = this.message + "!";
	}
});

var appVM = new AppVM();

var template = can.stache.from('chat-template');
var frag = template(appVM);
document.body.appendChild(frag);
