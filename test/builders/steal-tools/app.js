import helloworld from "helloworld.stache!stache";
import helloejs from "hello.ejs!ejs";
import hellomustache from "hello.mustache!mustache";

setTimeout(function(){
	$(document.body).append( helloworld({message: "Hi"}) );
	$(document.body).append( helloejs({message: "Hi"}) );
	$(document.body).append( hellomustache({message: "Hi"}) );
},10)

