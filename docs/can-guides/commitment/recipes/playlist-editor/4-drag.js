import { addJQueryEvents, Component } from "//unpkg.com/can@5/core.mjs";

addJQueryEvents(jQuery);

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

			<div>
				<input value:bind="this.searchQuery" placeholder="Search for videos" />
			</div>

			{{# if(this.searchResultsPromise.isPending) }}
				<div class="loading">Loading videos…</div>
			{{/ if }}

			{{# if(this.searchResultsPromise.isResolved) }}
				<ul class="source">
					{{# for(searchResult of this.searchResultsPromise.value) }}
						<li on:draginit="this.videoDrag(scope.arguments[1])">
							<a draggable="false" href="https://www.youtube.com/watch?v={{ searchResult.id.videoId }}" target="_blank">
								<img draggable="false" src="{{ searchResult.snippet.thumbnails.default.url }}" width="50px" />
							</a>
							{{ searchResult.snippet.title }}
						</li>
					{{/ for }}
				</ul>
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
		searchQuery: {
			type: "string",
			default: ""
		},
		get searchResultsPromise() {
			if (this.searchQuery.length > 2) {
				const results = gapi.client.youtube.search.list({
					q: this.searchQuery,
					part: "snippet",
					type: "video"
				}).then((response) => {
					console.info("Search results:", response.result.items);
					return response.result.items;
				});
				return results;
			}
		},
		videoDrag(drag) {
			drag.ghost().addClass("ghost");
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
