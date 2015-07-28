require("./todomvc-base");
require("./todo-app");
var can = require("can");
var jq = require("jquery");
var template = require("./index.stache!");

can.route(':filter');

var todoapp = jq('section:first');
todoapp.html(template());

can.route.ready();
