import helloworld from "helloworld.stache!stache";
import helloejs from "hello.ejs!ejs";
import hellomustache from "hello.mustache!mustache";


QUnit.module("steal-tools build");

test("templates", function(){
	var frag = helloworld({message: "Hi"});
	equal(frag.childNodes[0].innerHTML, "Stache Hi");
	

	frag = helloejs({message: "Hi"});
	equal(frag.childNodes[0].innerHTML, "EJS Hi");
	frag = hellomustache({message: "Hi"});
	equal(frag.childNodes[0].innerHTML, "Mustache Hi");
	
});

QUnit.start();
