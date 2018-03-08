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
		resource: 'https://chat.donejs.com/api/messages',
		contentType: 'application/x-www-form-urlencoded'
	},
	Map: Message,
	List: Message.List,
	name: 'message'
});

can.Component.extend({
	tag: "chat-messages",
	view: `
		<h1 class="page-header text-center">
		   Chat Messages
		</h1>
		<h5><a href="{{routeUrl(page='home')}}">Home</a></h5>

		{{#if(messagesPromise.isPending)}}
		  <div class="list-group-item list-group-item-info">
			<h4 class="list-group-item-heading">Loading…</h4>
		  </div>
		{{/if}}
		{{#if(messagesPromise.isRejected)}}
		  <div class="list-group-item list-group-item-danger">
			<h4 class="list-group3--item-heading">Error</h4>
			<p class="list-group-item-text">{{messagesPromise.reason}}</p>
		  </div>
		{{/if}}
		{{#if(messagesPromise.isResolved)}}
		  {{#each(messagesPromise.value)}}
			<div class="list-group-item">
			  <h4 class="list-group3--item-heading">{{name}}</h4>
			  <p class="list-group-item-text">{{body}}</p>
			</div>
		  {{else}}
			<div class="list-group-item">
			  <h4 class="list-group-item-heading">No messages</h4>
			</div>
		  {{/each}}
		{{/if}}

		<form class="row" on:submit="send(scope.event)">
		    <div class="col-sm-3">
		      <input type="text" class="form-control" placeholder="Your name"
		             value:bind="name"/>
		    </div>
		    <div class="col-sm-6">
		      <input type="text" class="form-control" placeholder="Your message"
		             value:bind="body"/>
		    </div>
		    <div class="col-sm-3">
		      <input type="submit" class="btn btn-primary btn-block" value="Send"/>
		    </div>
		</form>`,
	ViewModel: {
		messagesPromise: {
			default: function(){
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
	}
});

can.Component.extend({
	tag: "chat-app",
	view: `
		<div class="container">
		  <div class="row">
			<div class="col-sm-8 col-sm-offset-2">
			  {{#eq(page, 'home')}}
				  <h1 class="page-header text-center" on:click="addExcitement()">
					{{message}}
				  </h1>
				  <a href="{{routeUrl(page='chat')}}"
					 class="btn btn-primary btn-block btn-lg">
					   Start chat
				  </a>
			  {{else}}
				 <chat-messages/>
			  {{/eq}}
			</div>
		  </div>
		</div>`,
	ViewModel: {
		init(){
			can.route.register("{page}",{page: "home"});
			can.route.data = this;
			can.route.start();
		},
		page: "string",
		message: {
			type: "string",
			default: "Chat Home",
			serialize: false
		},
		addExcitement(){
			this.message = this.message + "!";
		}
	}
});
