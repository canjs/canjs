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

			main.start();
      liveReload();
    });
  }

  function liveReload(){
    if(!loader.has("live-reload")) {
      return;
    }

    loader.import("live-reload", { name: module.id }).then(function(reload){
      reload(function(){
				main.rerender();
			});

      reload(loader.main, function(r){
        main = r;
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
			body.appendChild(result.fragment);
		});
	},
	renderNode = function(url){
		var state = new this.viewModel;
		state.attr(can.route.deparam(url));
		return can.view.renderAsync(this.render, state);
	};

	function translate(load){
		var intermediateAndImports = getIntermediateAndImports(load.source);

		var ases = intermediateAndImports.ases;
		var imports = intermediateAndImports.imports;
		var args = ["stache"];
		can.each(ases, function(from, name){
			// Move the as to the front of the array.
			imports.splice(imports.indexOf(from), 1);
			imports.unshift(from);
			args.push(name);
		});
		imports.unshift("can/view/stache/stache");

		return "define("+JSON.stringify(intermediateAndImports.imports)+",function(" +
			args.join(", ") + "){\n" +
			"return {\n" +
			"\trender: stache(" + JSON.stringify(intermediateAndImports.intermediate) + "),\n" +
			"\tstart: " + start.toString() + ",\n" +
			"\trerender: " + rerender.toString() + ",\n" +
			"\trenderNode: " + renderNode.toString() + ",\n" +
			can.map(ases, function(from, name){
				return "\t" + name + ": " + name +"['default'] || " + name;
			}).join(",\n") +
			"\n};\n" +
		"})";
	}

  return {
    translate: translate
  };
});
