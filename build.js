var i, fileName, cmd, 
	plugins = [
	{plugin: "event/drag/limit", exclude: ["jquery/lang/vector/vector.js", "jquery/event/livehack/livehack.js", "jquery/event/drag/drag.js"]},
	{plugin: "event/drag/scroll", exclude: ["jquery/dom/within/within.js", "jquery/dom/compare/compare.js", "jquery/event/drop/drop.js","jquery/lang/vector/vector.js", "jquery/event/livehack/livehack.js", "jquery/event/drag/drag.js"]},
	"event/drop",
	"event/hover",
	"model",
	"view/ejs", 
	"dom/closest",
	"dom/compare",
	"dom/dimensions",
	"dom/fixtures",
	"dom/form_params",
	"dom/within"
]


var plugin, exclude;
for(i=0; i<plugins.length; i++){
	plugin = plugins[i];
	exclude = [];
	if (typeof plugin != "string") {
		plugin = plugins[i].plugin;
		exclude = plugins[i].exclude;
	}
	fileName = "jquery."+plugin.replace(/\//g, ".")+".js";
	print("***"+fileName)
	cmd = "js steal/scripts/pluginify.js jquery/"+plugin+" -destination jquery/dist/"+fileName;
	if(exclude.length)
		cmd += " -exclude "+exclude;
	runCommand(	"cmd", "/C", cmd)
}
