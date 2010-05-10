var i, fileName, cmd, 
	plugins = [
	"class", 
	"controller",
	"event/default",
	"event/destroyed",
	"event/drag",
	"event/hover",
	"model",
	"view/ejs", 
	"closest",
	"compare",
	"dimensions",
	"fixtures",
	"form_params",
	"within"
]


for(i=0; i<plugins.length; i++){
	fileName = "jquery."+plugins[i].replace("/", ".")+".js";
	cmd = "steal\\js steal/scripts/pluginify jquery/"+plugins[i]+" jquery/dist/"+fileName;
	runCommand(	"cmd", "/C", cmd)
}
