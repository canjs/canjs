var SourceMapConsumer = require('source-map').SourceMapConsumer;
var traverse = require('estraverse').traverse;


module.exports = function sourceMapToAst(ast, map) {
  map = new SourceMapConsumer(map);

  traverse(ast, {
    enter: function(node) {
      if (!(node.type && node.loc)) return;

      var origStart = map.originalPositionFor(node.loc.start);
      var origEnd = map.originalPositionFor(node.loc.end);

      if (!(origStart.line && origEnd.line)) {
        delete node.loc;
        return;
      }

      node.loc = {
        start: {
          line: origStart.line,
          column: origStart.column
        },
        end: {
          line: origEnd.line,
          column: origEnd.column
        },
        source: origStart.source,
        name: origStart.name
      };
    }
  });

  return ast;
};
