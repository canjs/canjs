module.exports = function(QUnit){
	return {
		pauseTest:function(){
			QUnit.stop();
		},
		resumeTest: function(){
			QUnit.start();
		},
		assertOK: function(assertion, message){
			QUnit.ok(assertion, message)
		},
		equiv: function(expected, actual){
			return QUnit.equiv(expected, actual);
		}
	};
};
