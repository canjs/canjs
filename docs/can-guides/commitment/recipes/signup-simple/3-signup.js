var AppViewModel = can.DefineMap.extend({
  sessionPromise: {
    default: function(){
      return can.ajax({
        url: "/api/session"
	  });
    }
  },

  email: "string",
  password: "string",
  signUp: function(event){
    event.preventDefault();
    this.sessionPromise = can.ajax({
      url: "/api/users",
      type: "post",
      data: {
        email: this.email,
        password: this.password
      }
    }).then(function(user){
      return {user: user};
    });
  }
});

var viewModel = new AppViewModel({});

var view = can.stache.from("app-view");
var frag = view(viewModel);

document.body.appendChild(frag);
