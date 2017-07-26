var AppViewModel = can.DefineMap.extend({
  sessionPromise: {
    value: function(){
      return can.ajax({
        url: "/api/session"
	  });
    }
  }
});

var viewModel = new AppViewModel({});

var view = can.stache.from("app-view");
var frag = view(viewModel);

document.body.appendChild(frag);
