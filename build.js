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
	"dom/closest",
	"dom/compare",
	"dom/dimensions",
	"dom/fixtures",
	"dom/form_params",
	"dom/within"
]


for(i=0; i<plugins.length; i++){
	fileName = "jquery."+plugins[i].replace("/", ".")+".js";
	print(fileName)
	cmd = "steal\\js steal/scripts/pluginify jquery/"+plugins[i]+" jquery/dist/"+fileName;
	runCommand(	"cmd", "/C", cmd)
}
