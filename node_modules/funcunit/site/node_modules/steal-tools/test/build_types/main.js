import 'main.css!';

function getFile(url, cb) {
	var xhr = new XMLHttpRequest();              
	xhr.open("GET", url, true);                             
	xhr.send(null);
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4) {
			cb(xhr.responseText);
		}
	};                                       
}

getFile(document.getElementsByTagName('link')[0].href, function(content){
	window.STYLE_CONTENT =  content;
});
