module.exports = function(jasmine){
  var paused = false;
  return {
    pauseTest:function(){
      paused = true;
      waitsFor(function(){
        return paused === false;
      }, 60000)
    },
    resumeTest: function(){
      paused = false;
    },
    assertOK: function(assertion){
      expect(assertion).toBeTruthy();
    },
    equiv: function(expected, actual){
      return jasmine.getEnv().equals_(expected, actual)
    }
  };
};
