import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class PlaylistEditor extends StacheElement {
	static view = `
	  {{# if(this.googleApiLoadedPromise.isPending) }}
		  <div>Loading Google API…</div>
	  {{ else }}
		  <div>Loaded Google API</div>
	  {{/ if }}
	`;

	static props = {
		googleApiLoadedPromise: {
			get default() {
				return googleApiLoadedPromise;
			}
		}
	};
}

customElements.define("playlist-editor", PlaylistEditor);