import can from 'can/view/ejs/ejs';

export function translate(load) {
	return "define(['can/view/ejs/ejs'],function(can){"+
		"return can.view.preloadStringRenderer('"+load.metadata.pluginArgument+"',"+
			'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
				text: load.source,
				name: load.name
			}).template.out + ' })'
		
		+")"+
	"})";
};
