import { StacheElement } from "can";

class PageLogin extends StacheElement {
	static get view() {
		return `
			<h1><code>&lt;page-login&gt;</code></h1>
			<p>This content is provided by the <code>&lt;page-login&gt;</code> component.</p>
			<p>Please click the <i>Login</i> button below to access your page.</p>
			<button on:click="this.login()">Login</button>
		`;
	}

	static get props() {
		return {
			isLoggedIn: Boolean
		};
	}

	login() {
		this.isLoggedIn = true;
	}
}

customElements.define("page-login", PageLogin);

export default PageLogin;
