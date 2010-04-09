var i, fileName, cmd, 
	plugins = [
	"class", 
	"controller",
	"event/default",
	"event/destroyed",
	"event/drag",
	"event/hover",
	"model",
	"view/ejs"
]


for(i=0; i<plugins.length; i++){
	fileName = "jquery."+plugins[i].replace("/", ".")+".js";
	cmd = "steal\\js steal/compress/plugin.js jquery/"+plugins[i]+" jquery/dist/"+fileName;
	runCommand(	"cmd", "/C", cmd)
}
