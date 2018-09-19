import { Component, route } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "chat-messages",
	view: `
		<h1 class="page-header text-center">
			Chat Messages
		</h1>
		<h5><a href="{{ routeUrl(page='home') }}">Home</a></h5>`
});

Component.extend({
	tag: "chat-app",
	view: `
		<div class="container">
			<div class="row">
				<div class="col-sm-8 col-sm-offset-2">
					{{# eq(this.routeData.page, 'home') }}
						<h1 class="page-header text-center" on:click="this.addExcitement()">
							{{ this.message }}
						</h1>
						<a href="{{ routeUrl(page='chat') }}"
							class="btn btn-primary btn-block btn-lg">
							Start chat
						</a>
					{{ else }}
						<chat-messages/>
					{{/ eq }}
				</div>
			</div>
		</div>`,
	ViewModel: {
		// Properties
		message: {
			type: "string",
			default: "Chat Home"
		},
		routeData: {
			default(){
				route.register("{page}",{page: "home"});
				route.start();
				return route.data;
			}
		},
		// Methods
		addExcitement(){
			this.message = this.message + "!";
		}
	}
});
