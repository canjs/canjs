var loader = require("@loader");
var steal = require("@steal");

var isNode = typeof process === "object" && {}.toString.call(process) ===
	"[object process]";
var importRegEx = /@import [^uU]['"]?([^'"\)]*)['"]?/g;
var resourceRegEx =  /url\(['"]?([^'"\)]*)['"]?\)/g;

var waitSeconds = (loader.cssOptions && loader.cssOptions.timeout)
	? parseInt(loader.cssOptions.timeout, 10) : 60;
var noop = function () {};
var onloadCss = function(link, cb){
	var styleSheets = getDocument().styleSheets,
		i = styleSheets.length;
	while( i-- ){
		if( styleSheets[ i ].href === link.href ){
			return cb();
		}
	}
	setTimeout(function() {
		onloadCss(link, cb);
	});
};

function getDocument() {
	if(typeof doneSsr !== "undefined" && doneSsr.globalDocument) {
		return doneSsr.globalDocument;
	}

	return typeof document === "undefined" ? undefined : document;
}

function getHead() {
	var doc = getDocument();
	var head = doc.head || doc.getElementsByTagName("head")[0];

	if(!head) {
		var docEl = doc.documentElement || doc;
		head = doc.createElement("head");
		docEl.insertBefore(head, docEl.firstChild);
	}
	return head;
}

/**
 *
 */
function CSSModule(address, source) {
	this.address = address;
	this.source = source;
}

CSSModule.prototype = {
	injectLink: function(){
		if(this._loaded) {
			return this._loaded;
		}

		if(this.linkExists()) {
			this._loaded = Promise.resolve('');
			return this._loaded;
		}

		// inspired by https://github.com/filamentgroup/loadCSS
		var doc = getDocument();
		var styleSheets = doc.styleSheets;
		var address = this.address;
		var link = this.link = doc.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = this.address;

		// wait until the css file is loaded
		this._loaded = new Promise(function(resolve, reject) {
			var timeout = setTimeout(function() {
				reject('Unable to load CSS');
			}, waitSeconds * 1000);

			var loadCB = function(event) {
				clearTimeout(timeout);
				link.removeEventListener("load", loadCB);
				link.removeEventListener("error", loadCB);

				if(event && event.type === "error"){
					reject('Unable to load CSS');
				} else {
					resolve('');
				}
			};

			// This code is for browsers that don’t support onload
			// No support for onload (it'll bind but never fire):
			//	* Android 4.3 (Samsung Galaxy S4, Browserstack)
			//	* Android 4.2 Browser (Samsung Galaxy SIII Mini GT-I8200L)
			//	* Android 2.3 (Pantech Burst P9070)
			// Weak inference targets Android < 4.4 and
			// a fallback for IE 8 and beneath
			if( "isApplicationInstalled" in navigator ||
			   !link.addEventListener) {
				// fallback, polling styleSheets
				onloadCss(link, loadCB);
			} else {
				// attach onload event for all modern browser
				link.addEventListener( "load", loadCB );
				link.addEventListener( "error", loadCB );
			}

			getHead().appendChild(link);
		});

		return this._loaded;
	},


	injectStyle: function(){
		var doc = getDocument();
		var head = getHead();
		var style = this.style = doc.createElement('style');

		// make source load relative to the current page
		style.type = 'text/css';

		if (style.styleSheet){
			style.styleSheet.cssText = this.source;
		} else {
			style.appendChild(doc.createTextNode(this.source));
		}
		head.appendChild(style);
	},

	// Replace @import's that don't start with a "u" or "U" and do start
	// with a single or double quote with a path wrapped in "url()"
	// relative to the page
	updateURLs: function(){
		var rawSource = this.source,
			address = this.address;

		this.source = rawSource.replace(importRegEx, function(whole, part){
			if(isNode) {
				return "@import url(" + part + ")";
			}else{
				return "@import url(" + steal.joinURIs(address, part) + ")";
			}
		});

		if(!isNode) {
			this.source = this.source + "/*# sourceURL=" + address + " */";
			this.source = this.source.replace(resourceRegEx, function(whole, part){
				return "url(" + steal.joinURIs(address, part) + ")";
			});

		}
		return this.source;
	},

	getExistingNode: function(){
		var doc = getDocument();
		var selector = "[href='" + this.address + "']";
		return doc.querySelector && doc.querySelector(selector);
	},

	linkExists: function(){
		var styleSheets = getDocument().styleSheets;
		for (var i = 0; i < styleSheets.length; ++i) {
			if(this.address === styleSheets[i].href){
				return true;
			}
		}
		return false;
	},

	setupLiveReload: function(loader, name){
		var head = getHead();

		if(loader.liveReloadInstalled) {
			var cssReload = loader["import"]("live-reload", {
				name: module.id
			});

			Promise.resolve(cssReload).then(function(reload){
				loader["import"](name).then(function(){
					reload.once(name, function(){
						head.removeChild(css.style);
					});
				});
			});
		}
	}
};


if(loader.isEnv("production")) {
	exports.fetch = function(load) {
		var css = new CSSModule(load.address);
		return css.injectLink();
	};
} else {
	exports.instantiate = function(load) {
		var loader = this;

		var css = new CSSModule(load.address, load.source);
		load.source = css.updateURLs();

		load.metadata.deps = [];
		load.metadata.format = "css";
		load.metadata.execute = function(){
			if(getDocument()) {
				css.injectStyle();
				css.setupLiveReload(loader, load.name);
			}

			return loader.newModule({
				source: css.source
			});
		};
	};

}

exports.CSSModule = CSSModule;
exports.locateScheme = true;
exports.buildType = "css";
exports.includeInBuild = true;
