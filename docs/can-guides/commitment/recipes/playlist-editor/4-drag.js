import { addJQueryEvents, StacheElement } from "//unpkg.com/can@6/core.mjs";

addJQueryEvents(jQuery);

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

			<div>
				<input value:bind="this.searchQuery" placeholder="Search for videos">
			</div>

			{{# if(this.searchResultsPromise.isPending) }}
				<div class="loading">Loading videos…</div>
			{{/ if }}

			{{# if(this.searchResultsPromise.isResolved) }}
				<ul class="source">
					{{# for(searchResult of this.searchResultsPromise.value) }}
						<li on:draginit="this.videoDrag(scope.arguments[1])">
							<a draggable="false" href="https://www.youtube.com/watch?v={{ searchResult.id.videoId }}" target="_blank">
								<img draggable="false" src="{{ searchResult.snippet.thumbnails.default.url }}" width="50px">
							</a>
							{{ searchResult.snippet.title }}
						</li>
					{{/ for }}
				</ul>
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
		},

		searchQuery: "",

		get searchResultsPromise() {
			if (this.searchQuery.length > 2) {
				return gapi.client.youtube.search
					.list({
						q: this.searchQuery,
						part: "snippet",
						type: "video"
					})
					.then(response => {
						console.info("Search results:", response.result.items);
						return response.result.items;
					});
			}
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

	videoDrag(drag) {
		drag.ghost().addClass("ghost");
	}
}

customElements.define("playlist-editor", PlaylistEditor);
