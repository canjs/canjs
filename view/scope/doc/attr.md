@function can.view.Scope.attr attr
@parent can.view.Scope.prototype

@param {can.Mustache.key} key A dot seperated path.  Use `"\."` if you have a
property name that includes a dot.

@return {*} The found value or undefined if no value is found.

@body

## Use

`scope.attr(key)` looks up a value in the current scope's
context, if a value is not found, parent scope's context
will be explored.

    var list = [{name: "Justin"},{name: "Brian"}],
        justin = list[0];

    var curScope = new can.view.Scope(list).add(justin);

    curScope.attr("name") //-> "Justin"
    curScope.attr("length") //-> 2