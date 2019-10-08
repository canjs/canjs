import { StacheElement, type } from "//unpkg.com/can@6/core.mjs";

class PlaylistEditor extends StacheElement {
	static view = `
		{{# if(this.googleApiLoadedPromise.isPending) }}
			<div>Loading Google API…</div>
		{{ else }}
			{{# if(this.signedIn) }}
				Welcome {{ this.givenName }}! <button on:click="this.googleAuth.signOut()">Sign Out</button>
			{{ else }}
				<button on:click="this.googleAuth.signIn()">Sign In</button>
			{{/ if }}
		{{/ if }}
	`;

	static props = {
		googleApiLoadedPromise: {
			get default() {
				return googleApiLoadedPromise;
			}
		},

		googleAuth: {
			async(resolve) {
				this.googleApiLoadedPromise.then(() => {
					resolve(gapi.auth2.getAuthInstance());
				});
			}
		},

		signedIn: Boolean,

		get givenName() {
			return (
				this.googleAuth &&
				this.googleAuth.currentUser
					.get()
					.getBasicProfile()
					.getGivenName()
			);
		}
	};

	connected() {
		this.listenTo("googleAuth", ({ value: googleAuth }) => {
			this.signedIn = googleAuth.isSignedIn.get();
			googleAuth.isSignedIn.listen(isSignedIn => {
				this.signedIn = isSignedIn;
			});
		});
	}
}

customElements.define("playlist-editor", PlaylistEditor);
