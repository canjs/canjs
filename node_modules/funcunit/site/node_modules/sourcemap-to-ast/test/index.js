var acorn = require('acorn');
var coffee = require('coffee-script');

var sourceMapToAst = require('../src');


global.expect = require('chai').expect;


run({
  'Suite': {
    'test': function() {
      var compiled = coffee.compile('x =\n 1', {sourceMap: true});
      var ast = acorn.parse(compiled.js, {locations: true});

      expect(compiled.js).to.eql(
        '(function() {\n' +
        '  var x;\n\n' +

        '  x = 1;\n\n' + // line 4 and columns 2 to 7

        '}).call(this);\n'
      );

      var func = ast.body[0].expression.callee.object;
      var funcBody = func.body.body;
      var assignment = funcBody[1].expression;

      expect(assignment.loc.start).to.eql({line: 4, column: 2});
      expect(assignment.loc.end).to.eql({line: 4, column: 7});

      sourceMapToAst(ast, compiled.v3SourceMap);

      expect(assignment.loc.start).to.eql({line: 1, column: 0});
      expect(assignment.loc.end).to.eql({line: 2, column: 1});
    }
  }
});
