import can from 'can/';
import tabsStache from './tabs.stache!';
/**
 * @module {function} components/tabs/ <tabs>
 * @parent myproject
 * 
 * @signature `<tabs>`
 * Creates a tabs component.
 */
export default can.Component.extend({
	tag: "tabs",
	template: tabsStache,
	scope: { ... }
	}
});


var foo = {
	versions: {
		"1.1": {
			"source": "git://github.com/bitovi/canjs#1.1-legacy",
			"sites": {
				"docs": {
					"parent" : "canjs"
				}
			},
			"path": "./old/1.1/can",
			"npmInstall": false
		},
		"2.1": "git://github.com/bitovi/canjs#master"
	},
	versionDest: "./<%= version %>/<%= name %>",
	defaultDest: "./<%= name %>",
	defaultVersion: "2.1",
	sites: {
		"pages" : {
			"dest" : ".",
			"glob" : {
				"pattern": "_pages/*.mustache",
				"ignore": ["lib/*/test/**/*"],
				"cwd": "."
			},
			"parent" : "index",
			"pageConfig" : {},
			"generators": ["html"],
			"static": "./theme/static",
			"templates": "./theme/templates",
			"minifyBuild": true,
			"forceBuild": true
		}
	},
	siteDefaults: {
	  "templates" : "theme/templates"	
	}
};