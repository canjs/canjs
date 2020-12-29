var steal = require("@steal");

steal.config({
	ext: {
		css: "steal-css"
	},
	paths: {
		"bootstrap/*": "folder/bootstrap/*",
		"steal-css": "../../css.js",
		"helpers": "./helpers.js"
	}
});
