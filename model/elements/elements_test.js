steal("can/model/elements", 'funcunit/qunit', function(){

module("jquery/model/elements")

test("identity uses the real id", function(){
  var Person = can.Model.extend({
    id:'ssn',
    _fullName: 'Person'
  },{
    ssn: function() {
      return 'xxx-xx-'+this.attr('ssn').substring(7);
    }
  })

  equals(new Person({ssn:'987-65-4321'}).identity(),'Person_987-65-4321');
})

})
