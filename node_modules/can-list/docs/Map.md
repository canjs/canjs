@property {can-map} can-list.Map Map
@parent can-list.static

@description Specify the Map type used to make objects added to this list observable.

@option {can-map} When objects are added to a `List`, those objects are converted into can.Map instances. For example:

     var list = new List();
     list.push({name: "Justin"});

     var map = list.attr(0);
     map.attr("name") //-> "Justin"

By changing [can-list.Map], you can specify a different type of Map instance to create. For example:

     var User = Map.extend({
       fullName: function(){
         return this.attr("first")+" "+this.attr("last")
       }
     });

     User.List = List.extend({
       Map: User
     }, {});

     var list = new User.List();
     list.push({first: "Justin", last: "Meyer"});

     var user = list.attr(0);
     user.fullName() //-> "Justin Meyer"
