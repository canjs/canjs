var comparify = require('../');

describe('Comparify', function() {

  var object = {
    key1: 1,
    key2: 2,
    keyNull: null,
    deep: {
      key3: 3
    },
    veryDeep: {
      value: {
        key4: 4
      }
    }
  };

  it('should check simple keys', function() {
    comparify(object, {key1: 1}).should.be.true;
    comparify(object, {key1: 0}).should.be.false;
    comparify(object, {keyNull: null}).should.be.true;
    comparify(object, {keyNull: 1}).should.be.false;
  });

  it('should check dot-notation keys', function() {
    comparify(object, {'deep.key3': 3}).should.be.true;
    comparify(object, {'deep.key3': 4}).should.be.false;
  });

  it('should check multiple keys', function() {
    comparify(object, {
      'key1': 1,
      key2: 2
    }).should.be.true;

    comparify(object, {
      'key1': 1,
      key2: 3
    }).should.be.false;
  });

  it('should check mixed simple and nested keys', function() {
    comparify(object, {
      'deep.key3': 3,
      key1: 1
    }).should.be.true;

    comparify(object, {
      'deep.key3': 2,
      key1: 1
    }).should.be.false;
  });

  it('should recurse through object searches', function() {
    comparify(object, {
      deep: {key3: 3}
    }).should.be.true;

    comparify(object, {
      deep: {key3: 4}
    }).should.be.false;
  });

  it('should always pass the same object', function() {
    comparify(object, object).should.be.true;
  });

  it('should handle mixed object and dot-notation', function() {
    comparify(object, {
      'deep.key3': 3,
      deep: {key3: 3}
    }).should.be.true;

    comparify(object, {
      'deep.key3': 4,
      deep: {key3: 3}
    }).should.be.false;

    comparify(object, {
      'deep.key3': 3,
      deep: {key3: 4}
    }).should.be.false;
  });

  it('should handle the kitchen sink', function() {
    comparify(object, {
      key1: 1,
      'key2': 2,
      keyNull: null,
      deep: {key3: 3},
      'deep.key3': 3,
      veryDeep: {
        'value.key4': 4,
        value: {key4: 4}
      },
      'veryDeep.value.key4': 4
    }).should.be.true;
  });

});
