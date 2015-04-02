import helloworld from "helloworld.stache!stache";
import helloejs from "hello.ejs!ejs";
import hellomustache from "hello.mustache!mustache";
import "can/view/autorender/";

window.MODULE = {
	ejs: helloejs({message: "Hi"}),
	mustache: hellomustache({message: "Hi"}),
	stache: helloworld({message: "Hi"})
};
