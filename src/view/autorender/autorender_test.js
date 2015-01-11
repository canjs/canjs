steal("can/test", "steal-qunit", function () {
	
	var makeIframe = function(src){
		var iframe = document.createElement('iframe');
		window.removeMyself = function(){
			delete window.removeMyself;
			document.body.removeChild(iframe);
			QUnit.start();
		};
		document.body.appendChild(iframe);
		iframe.src = src;
	};
		
	QUnit.module("can/view/autorender");
	if(window.steal) {
		asyncTest("the basics are able to work for steal", function(){
			makeIframe(  can.test.path("src/view/autorender/tests/steal-basics.html?"+Math.random()) );
			
		});
	}

});
