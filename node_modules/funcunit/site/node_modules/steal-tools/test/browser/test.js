var qunit = require("steal-qunit");

var makeIframe = function(src){
	var iframe = document.createElement('iframe');
	window.removeMyself = function(){
		delete window.removeMyself;
		document.body.removeChild(iframe);
	};
	document.body.appendChild(iframe);
	iframe.src = src;
};

if(window.Worker) {
	asyncTest("webworkers", function(){
		makeIframe("webworker/prod.html");
	});
}
