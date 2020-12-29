var util = require('../lib/util');

describe('util', function() {

  describe('.isObject', function() {

    it('should handle literal objects', function() {
      util.isObject({}).should.be.true;
    });

    it('should handle constructed objects', function() {
      util.isObject(new Object()).should.be.true;
    });

    it('should detect arrays', function() {
      util.isObject([]).should.be.false;
      util.isObject(new Array()).should.be.false;
    });

    it('should detect nulls', function() {
      util.isObject(null).should.be.false;
    });

    it('should detect numbers', function() {
      util.isObject(1).should.be.false;
    });

    it('should detect booleans', function() {
      util.isObject(true).should.be.false;
    });

    it('should detect strings', function() {
      util.isObject('test').should.be.false;
    });

    it('should detect undefined inputs', function() {
      util.isObject().should.be.false;
    });

  });

  describe('.getKey', function() {

    var object = {
        simple: 0,
        deep: {
          key: "value",
          deeper: {
            woah: "why?"
          }
        }
    };

    it('should get simple values', function() {
      util.getKey(object, 'simple').should.equal(0);
    });

    it('should get nested values', function() {
      util.getKey(object, 'deep.key').should.equal("value");
      util.getKey(object, 'deep.deeper.woah').should.equal('why?');
    });

    it('should return undefined for properties that don\'t exist', function() {
      var out = util.getKey(object, 'bad key');

      if (typeof out !== 'undefined') {
        throw new Error('Did not equal undefined');
      }
    });

  });

});
