require("./main.css!");

var xhr = new XMLHttpRequest();

xhr.open("GET", "dist/images/logo.png");

xhr.onload = function(){
	window.MODULE = {};
};

xhr.send();
