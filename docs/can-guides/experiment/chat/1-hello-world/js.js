import { StacheElement } from "//unpkg.com/can@pre/core.mjs";

class ChatApp extends StacheElement {
	static view = `
		<div class="container">
			<div class="row">
				<div class="col-sm-8 col-sm-offset-2">
					<h1 class="page-header text-center" on:click="this.addExcitement()">
						{{ this.message }}
					</h1>
				</div>
			</div>
		</div>
	`;

	static props = {
		// Properties
		message: {
			type: String,
			default: "Chat Home"
		}
	};

	addExcitement() {
		this.message = this.message + "!";
	}
};
customElements.define("chat-app", ChatApp);
