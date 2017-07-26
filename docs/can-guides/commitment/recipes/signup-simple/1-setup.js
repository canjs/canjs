var AppViewModel = can.DefineMap.extend({

});

var viewModel = new AppViewModel({});

var view = can.stache.from("app-view");
var frag = view(viewModel);

document.body.appendChild(frag);
