load('steal/file/file.js')

var i, fileName, cmd, 
	plugins = [
	"class", 
	"controller",
	{
		plugin: "controller/subscribe", 
		exclude: ["jquery/controller/controller.js",
				  "jquery/class/class.js",
				  "jquery/lang/lang.js",
				  "jquery/event/destroyed/destroyed.js",
				  "jquery/controller/controller.js"]},
	"event/default",
	"event/destroyed",
	"event/drag",
	{
		plugin: "event/drag/limit", 
		exclude: ["jquery/lang/vector/vector.js", "jquery/event/livehack/livehack.js", "jquery/event/drag/drag.js"]},
	{
		plugin: "event/drag/scroll", 
		exclude: ["jquery/dom/within/within.js", "jquery/dom/compare/compare.js", "jquery/event/drop/drop.js","jquery/lang/vector/vector.js", "jquery/event/livehack/livehack.js", "jquery/event/drag/drag.js"]},
	{
		plugin: "event/drop",
		exclude: ["jquery/lang/vector/vector.js", "jquery/event/livehack/livehack.js", "jquery/event/drag/drag.js"]},
	"event/hover",
	{
		plugin: "model", 
		exclude: ["jquery/class/class.js",
				  "jquery/lang/lang.js",
				  "jquery/event/destroyed/destroyed.js",
				  "jquery/lang/openajax/openajax.js"]},
	"view/ejs", 
	"dom/closest",
	"dom/compare",
	{
		plugin: "dom/dimensions",
		fileName: "jquery.dimensions.etc.js"
	},
	"dom/fixture",
	"dom/form_params",
	"dom/within", 
	"dom/cur_styles"
]


var plugin, exclude, fileDest, fileName;
for(i=0; i<plugins.length; i++){
	plugin = plugins[i];
	exclude = [];
	fileName = null;
	if (typeof plugin != "string") {
		fileName = plugin.fileName;
		exclude = plugin.exclude || [];
		plugin = plugin.plugin;
	}
	fileName = fileName || "jquery."+plugin.replace(/\//g, ".").replace(/dom\./, "").replace(/\_/, "")+".js";
	fileDest = "jquery/dist/"+fileName
	cmd = "js steal/scripts/pluginify.js jquery/"+plugin+" -destination "+fileDest;
	if(exclude.length)
		cmd += " -exclude "+exclude;
	runCommand(	"cmd", "/C", cmd)
	
	// compress 
	var outBaos = new java.io.ByteArrayOutputStream();
	var output = new java.io.PrintStream(outBaos);
	runCommand("java", "-jar", "steal/rhino/compiler.jar", "--compilation_level",
    	"SIMPLE_OPTIMIZATIONS", "--warning_level","QUIET",  "--js", fileDest, {output: output});
	
    var minFileDest = fileDest.replace(".js", ".min.js")
	new steal.File(minFileDest).save(outBaos.toString());
	print("***"+fileName+" pluginified and compressed")
}
