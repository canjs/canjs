/* jshint ignore:start */
var b = require( "steal-benchmark" );
var stache = require( "can-stache/can-stache" );
var DefineMap = require( "can-define/map/map" );
var DefineList = require( "can-define/list/list" );
var canBatch = require( "can-event/batch/batch" );

window.stache = stache;
window.DefineMap = DefineMap;
window.DefineList = DefineList;
window.canBatch = canBatch;

var suite = b.suite( "can-stache" );

suite.add( "can-stache spinning circles", function() {
	canBatch.start();
	for ( var n = 0; n < boxes.length; n++ ) {
		boxes[ n ].tick();
	}
	canBatch.stop();
}, {
	setup: function() {
		var template = stache(
			"{{#each boxes}}" +
			"<div class='box-view'>" +
			"<div class='box' id='box-{{number}}'  style='{{style}}'>" +
			"{{content}}" +
			"</div>" +
			"</div>" +
			"{{/each}}" );

		var boxes = new DefineList();

		var Box = DefineMap.extend({
			number: {},
			count: {value: 0},
			top: {},
			left: {},
			color: {},
			content: {},
			style: {},

			tick: function() {
				var count = this.count + 1;
				this.count = count;
				this.top = Math.sin(count / 10) * 10;
				this.left = Math.cos(count / 10) * 10;
				this.color = count % 255;
				this.content = count % 100;
				this.style = this.computeStyle();
			},
			computeStyle: function() {
				return 'top: ' + this.top + 'px; left: ' + this.left + 'px; background: rgb(0,0,' + this.color + ');';
			}
		});

		for ( var i = 0; i < 100; i++ ) {
			var box = new Box( {
				number: i
			} );
			box.tick();
			boxes.push( box );
		}

		var frag = template( {
			boxes: boxes
		} );
		var div = document.createElement( "div" );
		div.appendChild( frag );
		document.body.appendChild( div );
	},
	teardown: function() {
		document.body.removeChild( div );
	},

	onStart: function() {
		console.profile( "init" );
	},
	onComplete: function() {
		console.profileEnd( "init" );
	}
});
