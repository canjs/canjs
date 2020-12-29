var steal =  require("@steal");
var helpers = require("helpers");

require("./folder/main.css");

/* global assert, done, $ */
/* eslint no-console: off */

var testImage = function(selector) {
	return new Promise(function(resolve, reject) {
		var image = new Image();

		image.onload = function(){
			resolve();
		};

		image.onerror = function() {
			reject(new Error("Cannot load " + selector));
		};

		image.src = $(selector).css("background-image")
			.replace(/url\("?/,"")
			.replace(/"?\)/,"");
	});
};

function waitForCssToBeApplied() {
	return helpers.poll(function() {
		var btn = $(".btn.btn-danger");

		return btn.css("display") === "inline-block" &&
			btn.css("backgroundColor") === "rgb(255, 0, 0)";
	});
}

function log() {
	var btn = $(".btn.btn-danger");
	console.log("Button display: ", btn.css("display"));
	console.log("Button backgroundColor: ", btn.css("backgroundColor"));

	console.log("background-image", $("#test-element").css("background-image"));
	console.log("tilde", $("#test-relative").css("background-image"));
}

if(steal.isEnv('production')) {
	if (typeof window !== "undefined" && window.assert) {

		waitForCssToBeApplied()
			.then(function() {
				var btn = $(".btn.btn-danger");
				assert.equal(btn.css("display"), "inline-block", '@import "locate://"; styles applied');
				assert.equal(btn.css("backgroundColor"), "rgb(255, 0, 0)", '@import url("locate://"); styles applied');
			})
			.then(function() {
				return testImage("#test-element");
			})
			.then(function() {
				assert.ok(true, "background-image: url(../); styles applied");
				return testImage("#test-relative");
			})
			.then(function() {
				assert.ok(true, "background-image: url(locate://); styles applied");
				done();
			})
			.catch(function(err) {
				assert.ok(false, err);
				done();
			});
	} else {
		waitForCssToBeApplied().then(log);
	}

	// develop
} else {
	// Wait for the @import's to resolve in the <style>
	// tag added by the main.css! import
	helpers.waitForCssRules($('style')[0], function() {
		if (typeof window !== "undefined" && window.assert) {

			waitForCssToBeApplied()
				.then(function() {
					var btn = $('.btn.btn-danger');
					assert.equal(btn.css("display"), "inline-block", '@import "locate://"; styles applied');
					assert.equal(btn.css("backgroundColor"), "rgb(255, 0, 0)", '@import url("locate://"); styles applied');
				})
				.then(function() {
					return testImage("#test-element");
				})
				.then(function() {
					assert.ok(true, "background-image: url(../); styles applied");
					return testImage("#test-relative");
				})
				.then(function() {
					assert.ok(true, "background-image: url(locate://); styles applied");
					done();
				})
				.catch(function(err) {
					assert.notOk(err, "should not fail");
					done();
				});
		} else {
			waitForCssToBeApplied().then(log);
		}
	});
}
