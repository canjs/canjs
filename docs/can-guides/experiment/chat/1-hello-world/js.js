import { StacheElement, type } from "//unpkg.com/can@5/core.mjs";

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
			type: type.maybeConvert(String),
			default: "Chat Home"
		}
	};

    addExcitement() {
        this.message = this.message + "!";
    }
};
customElements.define("chat-app", ChatApp);
