import can from "can/";
import tmpl from "template.stache!stache";

window.MODULE = {
	html: tmpl().childNodes[0].innerHTML
};
