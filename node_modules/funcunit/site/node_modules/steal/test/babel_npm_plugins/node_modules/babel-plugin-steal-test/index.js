// adds `window.foo = "default";` at the top of the module
// will repleace "default" with the content of options.text
module.exports = function(babel) {
  var t = babel.types;

  return {
    visitor: {
      Program: function(path, state) {
        var options = state.opts;

        path.unshiftContainer("body", [
          t.expressionStatement(
            t.assignmentExpression(
              "=",
              t.memberExpression(t.identifier("window"), t.identifier("foo")),
              t.stringLiteral(options.text ? options.text : "default")
            )
          )
        ]);
      }
    }
  };
};
