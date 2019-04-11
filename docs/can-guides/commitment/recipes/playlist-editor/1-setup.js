import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "playlist-editor",
	view: `
		{{# if(this.googleApiLoadedPromise.isPending) }}
			<div>Loading Google API…</div>
		{{ else }}
			<div>Loaded Google API</div>
		{{/ if }}
	`,
	ViewModel: {
		googleApiLoadedPromise: {
			default: () => googleApiLoadedPromise
		}
	}
});