(function() {

module("can/map/elements")

test("identity uses the real id", function(){
  var Person = can.Model.extend({
    id:'ssn',
    _fullName: 'Person'
  },{
  })

  equal(new Person({ssn:'987-65-4321'}).identity(),'Person_987-65-4321');
})

})()
