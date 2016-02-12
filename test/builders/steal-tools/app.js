import helloworld from "helloworld.stache!stache";
import "can/view/autorender/";

function capitalize(txt){
	return txt.toUpperCase();
}

window.MODULE = {
	stache: helloworld({message: "Hi"}, { capitalize: capitalize })
};
