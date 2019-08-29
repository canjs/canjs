import { route, StacheElement, type } from "//unpkg.com/can@5/core.mjs";

class ChatMessages extends StacheElement {
    static view = `
		<h1 class="page-header text-center">
			Chat Messages
		</h1>
		<h5><a href="{{ routeUrl(page='home') }}">Home</a></h5>
	`;
};
customElements.define("chat-messages", ChatMessages);

class ChatApp extends StacheElement {
	static view = `
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
		</div>
	`;

	static props = {
		// Properties
		message: {
			type: String,
			default: "Chat Home"
		},

		routeData: {
			get default() {
				route.register("{page}",{page: "home"});
				route.start();
				return route.data;
			}
		}
	};

	addExcitement() {
		this.message = this.message + "!";
	}
};
customElements.define("chat-app", ChatApp);
