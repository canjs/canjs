var loader = require("@loader");
var steal = require("@steal");

var isNode = typeof process === "object" && {}.toString.call(process) ===
	"[object process]";
var importRegEx = /@import [^uU]['"]?([^'"\)]*)['"]?/g;
var resourceRegEx =  /url\(['"]?([^'"\)]*)['"]?\)/g;

var waitSeconds = (loader.cssOptions && loader.cssOptions.timeout)
	? parseInt(loader.cssOptions.timeout, 10) : 60;
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

function isIE9() {
	var doc = getDocument();

	// https://github.com/conditionizr/conditionizr/blob/111964e63ddda5f2db5dbc3c1587dfda9f5ca3b2/detects/ie9.js#L6
	return doc &&
		!!(Function('/*@cc_on return (/^9/.test(@_jscript_version) && /MSIE 9\.0(?!.*IEMobile)/i.test(navigator.userAgent)); @*/')());
}

function getDocument() {
	if(typeof doneSsr !== "undefined" && doneSsr.globalDocument) {
		return doneSsr.globalDocument;
	}

	if(typeof document !== "undefined") {
		return document;
	}

	throw new Error("Unable to load CSS in an environment without a document.");
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
function CSSModule(load, loader) {
	if(typeof load === "object") {
		this.load = load;
		this.loader = loader;
		this.address = this.load.address;
		this.source = this.load.source;
	} else {
		this.address = load; // this is a string
		this.source = loader; // this is a string
	}
}

// required for IE9 stylesheet limit hack
CSSModule.cssCount = 0;
CSSModule.ie9MaxStyleSheets = 31;
CSSModule.currentStyleSheet = null;

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
			//  * Zombie headless browser
			// Weak inference targets Android < 4.4 and
			// a fallback for IE 8 and beneath
			if("isApplicationInstalled" in navigator || !link.addEventListener) {
				// fallback, polling styleSheets
				onloadCss(link, loadCB);
			} else if(navigator.noUI){
				// Zombie
				loadCB();
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

		// Starting with IE11, `styleSheet` isn't support but `sheet` is
		// https://msdn.microsoft.com/en-us/library/dd347030(v=vs.85).aspx
		if (style.sheet) {
			style.sheet.cssText = this.source;
		} else if (style.styleSheet) {
			style.styleSheet.cssText = this.source;
		} else {
			style.appendChild(doc.createTextNode(this.source));
		}

		head.appendChild(style);
	},

	/**
	 * Inject stylesheets and re-used them to avoid IE9 limit
	 * https://blogs.msdn.microsoft.com/ieinternals/2011/05/14/stylesheet-limits-in-internet-explorer/
	 */
	ie9StyleSheetLimitHack: function() {
		var doc = getDocument();

		// create the sheet to be re-used until limit is reached
		if (!CSSModule.cssCount) {
			CSSModule.currentStyleSheet = doc.createStyleSheet();
		}

		CSSModule.cssCount += 1;
		CSSModule.currentStyleSheet.cssText += this.source;

		// reset the count to force the creation of a new stylesheet
		if (CSSModule.cssCount === CSSModule.ie9MaxStyleSheets) {
			CSSModule.cssCount = 0;
		}
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

		if(!loader.isEnv('build')) {
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
		var css = this;

		if(loader.liveReloadInstalled) {
			var cssReload = loader["import"]("live-reload", {
				name: module.id
			});

			Promise.resolve(cssReload).then(function(reload){
				loader["import"](name).then(function(){
					reload.once("!dispose/" + name, function(){
						css.style.__isDirty = true;
						reload.once("!cycleComplete", function(){
							head.removeChild(css.style);
						});
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
			if (getDocument()) {
				if (isIE9()) {
					css.ie9StyleSheetLimitHack();
				} else {
					css.injectStyle();
				}
				css.setupLiveReload(loader, load.name);
			}

			return loader.newModule({
				source: css.source
			});
		};
	};

}

exports.CSSModule = CSSModule;
exports.getDocument = getDocument;
exports.getHead = getHead;
exports.locateScheme = true;
exports.buildType = "css";
exports.includeInBuild = true;
exports.pluginBuilder = "steal-css/slim";
