import { ajax, fixture, StacheElement, type } from "//unpkg.com/can@pre/core.mjs";

fixture("POST /api/session", function(request, response) {
	const userData = localStorage.getItem("user");
	if (userData) {
		const user = JSON.parse(userData);
		const requestUser = request.data.user;
		if (
			user.email === requestUser.email &&
			user.password === requestUser.password
		) {
			return request.data;
		} else {
			response(401, { message: "Unauthorized" }, {}, "unauthorized");
		}
	}
	response(401, { message: "Unauthorized" }, {}, "unauthorized");
});
fixture("GET /api/session", function(request, response) {
	const session = localStorage.getItem("session");
	if (session) {
		response(JSON.parse(session));
	} else {
		response(404, { message: "No session" }, {}, "unauthorized");
	}
});
fixture("DELETE /api/session", function() {
	localStorage.removeItem("session");
	return {};
});
fixture("POST /api/users", function(request) {
	const session = {
		user: { email: request.data.email }
	};
	localStorage.setItem("user", JSON.stringify(request.data));
	localStorage.setItem("session", JSON.stringify(session));

	return session.user;
});

class SignupLogin extends StacheElement {
	static view = `
		<p class="welcome-message">
			Welcome Someone.
			<a href="javascript://">Log out</a>
		</p>

		<form>
			<h2>Sign Up</h2>

			<input placeholder="email" />

			<input type="password"
					 placeholder="password" />

			<button>Sign Up</button>

			<aside>
				Have an account?
				<a href="javascript://">Log in</a>
			</aside>
		</form>
	`;
}
customElements.define("signup-login", SignupLogin);
