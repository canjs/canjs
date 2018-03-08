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
				 <h1 class="page-header text-center">
					Chat Messages
				 </h1>
				 <h5><a href="{{routeUrl(page='home')}}">Home</a></h5>
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
