const PlaylistVM = can.DefineMap.extend( "PlaylistVM", {
	init: function() {
		const self = this;
		self.on( "googleAuth", function( ev, googleAuth ) {
			self.signedIn = googleAuth.isSignedIn.get();
			googleAuth.isSignedIn.listen( function( isSignedIn ) {
				self.signedIn = isSignedIn;
			} );
		} );
	},
	googleApiLoadedPromise: {
		default: googleApiLoadedPromise
	},
	googleAuth: {
		get: function( lastSet, resolve ) {
			this.googleApiLoadedPromise.then( function() {
				resolve( gapi.auth2.getAuthInstance() );
			} );
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
		if ( this.searchQuery.length > 2 ) {
			const results = gapi.client.youtube.search.list( {
				q: this.searchQuery,
				part: "snippet",
				type: "video"
			} ).then( function( response ) {
				console.log( response.result.items );
				return response.result.items;
			} );
			return new Promise( function( resolve, reject ) {
				results.then( resolve, reject );
			} );
		}
	},
	videoDrag: function( drag ) {
		drag.ghost().addClass( "ghost" );
	},
	getDragData: function( drag ) {
		return can.data.get.call( drag.element[ 0 ], "dragData" );
	},
	dropPlaceholderData: "any",
	playlistVideos: {
		Type: [ "any" ],
		Default: can.DefineList
	},
	addDropPlaceholder: function( index, video ) {
		this.dropPlaceholderData = {
			index: index,
			video: video
		};
	},
	clearDropPlaceholder: function() {
		this.dropPlaceholderData = null;
	},
	addVideo: function( index, video ) {
		this.dropPlaceholderData = null;
		if ( index >= this.playlistVideos.length ) {
			this.playlistVideos.push( video );
		} else {
			this.playlistVideos.splice( index, 0, video );
		}
	},
	get videosWithDropPlaceholder() {
		const copy = this.playlistVideos.map( function( video ) {
			return {
				video: video,
				isPlaceholder: false
			};
		} );
		if ( this.dropPlaceholderData ) {
			copy.splice( this.dropPlaceholderData.index, 0, {
				video: this.dropPlaceholderData.video,
				isPlaceholder: true
			} );
		}
		return copy;
	}
} );
const Sortable = can.Control.extend( {
	"{element} dropmove": function( el, ev, drop, drag ) {
		this.fireEventForDropPosition( ev, drop, drag, "sortableplaceholderat" );
	},
	"{element} dropon": function( el, ev, drop, drag ) {
		this.fireEventForDropPosition( ev, drop, drag, "sortableinsertat" );
	},
	fireEventForDropPosition: function( ev, drop, drag, eventName ) {
		const dragData = can.data.get.call( drag.element[ 0 ], "dragData" );
		const sortables = $( this.element ).children();
		for ( let i = 0; i < sortables.length; i++ ) {

			//check if cursor is past 1/2 way
			const sortable = $( sortables[ i ] );
			if ( ev.pageY < Math.floor( sortable.offset().top + sortable.height() / 2 ) ) {

				// index at which it needs to be inserted before
				$( this.element ).trigger( {
					type: eventName,
					index: i,
					dragData: dragData
				} );
				return;
			}
		}
		if ( !sortables.length ) {
			$( this.element ).trigger( {
				type: eventName,
				index: 0,
				dragData: dragData
			} );
		} else {
			$( this.element ).trigger( {
				type: eventName,
				index: sortables.length,
				dragData: dragData
			} );
		}
	}
} );
can.view.callbacks.attr( "sortable", function( el ) {
	new Sortable( el );
} );
const vm = new PlaylistVM();
const template = can.stache.from( "app-template" );
const frag = template( vm );
document.body.appendChild( frag );
