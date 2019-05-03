import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "playlist-editor",
	view: `
		{{# if(this.googleApiLoadedPromise.isPending) }}
			<div>Loading Google API…</div>
		{{ else }}
			{{# if(this.signedIn) }}
				Welcome {{ this.givenName }}! <button on:click="this.googleAuth.signOut()">Sign Out</button>
			{{ else }}
				<button on:click="this.googleAuth.signIn()">Sign In</button>
			{{/ if }}
		{{/ if }}
	`,
	ViewModel: {
		googleApiLoadedPromise: {
			default: () => googleApiLoadedPromise
		},
		googleAuth: {
			get(lastSet, resolve) {
				this.googleApiLoadedPromise.then(() => {
					resolve(gapi.auth2.getAuthInstance());
				});
			}
		},
		signedIn: "boolean",
		get givenName() {
			return this.googleAuth &&
				this.googleAuth.currentUser.get().getBasicProfile().getGivenName();
		},
		connectedCallback() {
			this.listenTo("googleAuth", (ev, googleAuth) => {
				this.signedIn = googleAuth.isSignedIn.get();
				googleAuth.isSignedIn.listen((isSignedIn) => {
					this.signedIn = isSignedIn;
				});
			});
		}
	}
});
