import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "chat-app",
	view: `
		<div class="container">
			<div class="row">
				<div class="col-sm-8 col-sm-offset-2">
					<h1 class="page-header text-center" on:click="this.addExcitement()">
						{{ this.message }}
					</h1>
				</div>
			</div>
		</div>`,
	ViewModel: {
		// Properties
		message: {
			type: "string",
			default: "Chat Home"
		},
		// Methods
		addExcitement(){
			this.message = this.message + "!";
		}
	}
});
