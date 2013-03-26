LIBRARIES = {
	jquery : {
		name : 'jQuery',
		libraryLoaded : function () {
			return window.jQuery;
		},
		steal : {
			map : {
				"*" : {
					"jquery/jquery.js" : "jquery",
					"can/util/util.js" : "can/util/jquery/jquery.js"
				}
			}
		}
	},
	yui : {
		name : 'YUI',
		libraryLoaded : function () {
			return window.YUI;
		},
		steal : {
			map : {
				"*" : {
					"can/util/util.js" : "can/util/yui/yui.js"
				}
			}
		}
	},
	zepto : {
		name : 'Zepto',
		libraryLoaded : function () {
			return window.Zepto;
		},
		steal : {
			map : {
				"*" : {
					"can/util/util.js" : "can/util/zepto/zepto.js"
				}
			}
		}
	},
	mootools : {
		name : 'Mootools',
		libraryLoaded : function () {
			return window.MooTools;
		},
		steal : {
			map : {
				"*" : {
					"can/util/util.js" : "can/util/mootools/mootools.js"
				}
			}
		}
	},
	dojo : {
		name : 'Dojo',
		libraryLoaded : function () {
			return window.dojo;
		},
		steal : {
			map : {
				"*" : {
					"can/util/util.js" : "can/util/dojo/dojo.js"
				}
			}
		}
	}
}

if(typeof steal !== 'undefined') {
	steal(function() {
		return LIBRARIES;
	});
}
