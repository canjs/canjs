import { ajax, Component, fixture } from "//unpkg.com/can@5/core.mjs";

fixture("GET /api/session", function(request, response) {
	const session = localStorage.getItem("session");
	if (session) {
		response(JSON.parse(session));
	} else {
		response(404, { message: "No session" }, {}, "unauthorized");
	}
});
fixture("POST /api/users", function(request, response) {
	const session = {
		user: { email: request.data.email }
	};
	localStorage.setItem("user", JSON.stringify(request.data));
	localStorage.setItem("session", JSON.stringify(session));

	return session.user;
});
fixture("DELETE /api/session", function() {
	localStorage.removeItem("session");
	return {};
});

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

Component.extend({
	tag: "signup-login",
	view: `
		{{# if(this.sessionPromise.value) }}

			<p class="welcome-message">
				Welcome {{ this.sessionPromise.value.user.email }}.
				<a href="javascript://" on:click="this.logOut()">Log out</a>
			</p>

		{{ else }}

			<form on:submit="this.signUp(scope.event)">
				<h2>Sign Up</h2>

				<input placeholder="email" value:to="this.email" />

				<input type="password"
						 placeholder="password" value:to="this.password" />

				<button>Sign Up</button>

				<aside>
					Have an account?
					<a href="javascript://">Log in</a>
				</aside>
			</form>

		{{/ if }}
	`,
	ViewModel: {
		sessionPromise: {
			default: function() {
				return ajax({
					url: "/api/session"
				});
			}
		},

		email: "string",
		password: "string",
		signUp: function(event) {
			event.preventDefault();
			this.sessionPromise = ajax({
				url: "/api/users",
				type: "post",
				data: {
					email: this.email,
					password: this.password
				}
			}).then(function(user) {
				return {user: user};
			});
		},

		logOut: function() {
			this.sessionPromise = ajax({
				url: "/api/session",
				type: "delete"
			}).then(function() {
				return Promise.reject({message: "Unauthorized"});
			});
		}
	}
});
