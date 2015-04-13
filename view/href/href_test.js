steal("can/test", "steal-qunit", function () {

	var makeIframe = function(src){
		var iframe = document.createElement('iframe');
		window.removeMyself = function(){
			delete window.removeMyself;
			delete window.isReady;
			delete window.hasError;
			document.body.removeChild(iframe);
			start();
		};
		window.hasError = function(error) {
			ok(false, error.message);
			window.removeMyself();
		};
		window.isReady = function(el, scope) {

			equal(el.find('a').attr('href'), "#!page=recipe&id=5", "should set href attribute");

			window.removeMyself();
		};
		document.body.appendChild(iframe);
		iframe.src = src;
	};

	QUnit.module("can/view/href");
	if(window.steal) {
		asyncTest("the basics are able to work for steal", function(){
			makeIframe(  can.test.path("view/href/tests/steal-basics.html?"+Math.random()) );
		});
	}
	//else if(window.requirejs) {
	//	asyncTest("the basics are able to work for requirejs", function(){
	//		makeIframe(can.test.path("../../view/href/tests/requirejs-basics.html?"+Math.random()));
	//	});
	//} else {
	//	asyncTest("the basics are able to work standalone", function(){
	//		makeIframe(can.test.path("view/href/tests/standalone-basics.html?"+Math.random()));
	//	});
	//}

});
