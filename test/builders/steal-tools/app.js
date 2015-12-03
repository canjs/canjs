import helloworld from "helloworld.stache!stache";
import helloejs from "hello.ejs!ejs";
import hellomustache from "hello.mustache!mustache";
import "can/view/autorender/";

function capitalize(txt){
	return txt.toUpperCase();
}

window.MODULE = {
	ejs: helloejs({message: "Hi"}),
	mustache: hellomustache({message: "Hi"}),
	stache: helloworld({message: "Hi"}, { capitalize: capitalize })
};
