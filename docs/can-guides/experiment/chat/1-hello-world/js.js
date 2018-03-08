can.Component.extend({
	tag: "chat-app",
	view: `
		<div class="container">
		  <div class="row">
		    <div class="col-sm-8 col-sm-offset-2">
			  <h1 class="page-header text-center" on:click="addExcitement()">
		        {{message}}
		      </h1>
		    </div>
		  </div>
		</div>`,
	ViewModel: {
		message: {
			type: "string",
			default: "Chat Home"
		},
		addExcitement(){
			this.message = this.message + "!";
		}
	}
});
