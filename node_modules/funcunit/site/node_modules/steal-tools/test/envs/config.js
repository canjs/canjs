System.config({
	envs: {
		"build-development": {
			map: {
				"dep": "other"
			},
			meta: {
				"global": {
					"format": "global",
					"deps": ["jquerty"]
				}
			}
		},
		"window-production": {
			map: {
				"dep": "other"
			}
		}
	},
	meta: {
		"global": {
			format: "global",
			deps: []
		}
	}
});
