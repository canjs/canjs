import $ from "jquery";
import "./tabs.less!";
import "./utils/utils";

$.fn.tabs = function(){
	this.addClass("tabs").text("tabs!");
};

export default $.fn.tabs;
