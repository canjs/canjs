define(["@loader", "module", "can/view/stache/intermediate_and_imports"], function(loader, module, getIntermediateAndImports){

  var main;

  var isNode = typeof process === "object" &&
    {}.toString.call(process) === "[object process]";

  if(!isNode) {
    steal.done().then(setup);
  }

  function setup(){
    loader.import(loader.main).then(function(r){
      main = r;
      liveReload();
    });
  }

  function liveReload(){
    if(!loader.has("live-reload")) {
      return;
    }

    loader.import("live-reload", { name: module.id }).then(function(reload){
			loader.normalize(loader.main).then(function(mainName){
				reload(function(){
					main.rerender();
				});

				reload(mainName, function(r){
					main = r;
				});
			});
    });
  }

	var start = function(){
		var state = this.state = new this.viewModel;
		can.route.map(state);
		can.route.ready();
		this.rerender();
	},
	rerender = function(){
		var body = document.body;
		can.view.renderAsync(this.render, this.state).then(function(result){
			can.each(can.makeArray(body.childNodes), function(el){
				if(el.tagName && el.tagName.toLowerCase() !== "script") {
					can.remove(el);
				}
			});
			can.appendChild(body, result.fragment);
		});
	},
	renderNode = function(url){
		var state = new this.viewModel;
		state.attr(can.route.deparam(url));
		var doc = new document.constructor;

		var renderPromise = can.view.renderAsync(this.render, state, {}, doc)
		.then(function(result){
			var html = doc.body.innerHTML;

			triggerInBody("removed");
			doc.documentElement.removeChild(doc.body);

			return {
				html: html,
				data: result.data
			};
		});

		function triggerInBody(event) {
			// Do cleanup here.
			function traverse(el){
				var cur = el.firstChild;
				while(cur) {
					can.trigger(cur, event);
					traverse(cur);
					cur = cur.nextSibling;
				}
			}

			var cur = doc.body.firstChild;
			while(cur) {
				traverse(cur);
				can.trigger(cur, event);
				cur = cur.nextSibling;
			}
		}


		return renderPromise;
	};

	function translate(load){
		var intermediateAndImports = getIntermediateAndImports(load.source);

		var ases = intermediateAndImports.ases;
		var imports = intermediateAndImports.imports;
		var args = [];
		can.each(ases, function(from, name){
			// Move the as to the front of the array.
			imports.splice(imports.indexOf(from), 1);
			imports.unshift(from);
			args.unshift(name);
		});
		imports.unshift("can/view/stache/stache");
		args.unshift("stache");

		return "define("+JSON.stringify(intermediateAndImports.imports)+",function(" +
			args.join(", ") + "){\n" +
			"var __export = {\n" +
			"\trender: stache(" + JSON.stringify(intermediateAndImports.intermediate) + "),\n" +
			"\tstart: " + start.toString() + ",\n" +
			"\trerender: " + rerender.toString() + ",\n" +
			"\trenderNode: " + renderNode.toString() + ",\n" +
			can.map(ases, function(from, name){
				return "\t" + name + ": " + name +"['default'] || " + name;
			}).join(",\n") +
			"\n};\n\n" +
			"if(typeof steal !== 'undefined' && !(typeof process === 'object' && {}.toString.call(process) === '[object process]')) steal.done().then(function() { __export.start(); });\n" +
			"return __export;\n" +
		"});";
	}

  return {
    translate: translate
  };
});
