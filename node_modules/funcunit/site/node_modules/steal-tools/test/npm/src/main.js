import $ from "jquery";
import * as child from "./child";

window.MODULE = {
	child: child
};

$("body").html("<h1>Hello World</h1>");

