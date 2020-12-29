module.exports = function (grunt) {
	grunt.initConfig({
		"steal-build": {
			bundle: {
				options: {
					system: {
						config: "package.json!npm"
					},
					buildOptions:{
						bundleSteal:true
					}
				}
			}
		}
	});
	grunt.loadNpmTasks("steal-tools");
	grunt.registerTask("build", ["steal-build"]);
};