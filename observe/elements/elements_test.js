(function() {

module("jquery/observe/elements")

test("identity uses the real id", function(){
  var Person = can.Model.extend({
    id:'ssn',
    _fullName: 'Person'
  },{
    ssn: function() {
      return 'xxx-xx-'+this.attr('ssn').substring(7);
    }
  })

  equal(new Person({ssn:'987-65-4321'}).identity(),'Person_987-65-4321');
})

})()
