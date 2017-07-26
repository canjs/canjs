var AppViewModel = can.DefineMap.extend({
  sessionPromise: {
    value: function(){
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
  },

  logOut: function(){
    this.sessionPromise = can.ajax({
      url: "/api/session",
      type: "delete"
    }).then(function(){
      return Promise.reject({message: "Unauthorized"});
    });
  },

  page: {value: "login"},
  gotoSignUp: function(){
    this.page = "signup";
  },
  gotoLogIn: function(){
    this.page = "login";
  },
  logIn: function(event){
    event.preventDefault();
    this.sessionPromise = can.ajax({
      url: "/api/session",
      type: "post",
      data: {
        user: {
          email: this.email,
          password: this.password
        }
      }
    });
  }
});

var viewModel = new AppViewModel({});

var view = can.stache.from("app-view");
var frag = view(viewModel);

document.body.appendChild(frag);
