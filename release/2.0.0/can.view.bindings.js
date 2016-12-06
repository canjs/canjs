/*!
 * CanJS - 2.0.0
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 16 Oct 2013 21:40:44 GMT
 * Licensed MIT
 * Includes: can/view/bindings
 * Download from: http://canjs.com
 */
(function(can) {




    can.view.Scanner.attribute("can-value", function(data, el) {

        var attr = el.getAttribute("can-value"),
            value = data.scope.compute(attr);

        if (el.nodeName.toLowerCase() === "input") {
            if (el.type === "checkbox") {
                if (el.hasAttribute("can-true-value")) {
                    var trueValue = data.scope.compute(el.getAttribute("can-true-value"))
                } else {
                    var trueValue = can.compute(true)
                }
                if (el.hasAttribute("can-false-value")) {
                    var falseValue = data.scope.compute(el.getAttribute("can-false-value"))
                } else {
                    var falseValue = can.compute(false)
                }
            }

            if (el.type === "checkbox" || el.type === "radio") {
                new Checked(el, {
                        value: value,
                        trueValue: trueValue,
                        falseValue: falseValue
                    });
                return;
            }
        }

        new Value(el, {
                value: value
            })
    });

    var special = {
        enter: function(data, el, original) {
            return {
                event: "keyup",
                handler: function(ev) {
                    if (ev.keyCode == 13) {
                        return original.call(this, ev)
                    }
                }
            }
        }
    }


    can.view.Scanner.attribute(/can-[\w\.]+/, function(data, el) {

        var event = data.attr.substr("can-".length),
            attr = el.getAttribute(data.attr),
            scopeData = data.scope.get(attr),
            handler = function(ev) {

                return scopeData.value.call(scopeData.parent, data.scope.attr("."), can.$(this), ev)
            };

        if (special[event]) {
            var specialData = special[event](data, el, handler);
            handler = specialData.handler;
            event = specialData.event;
        }

        can.bind.call(el, event, handler);
        // not all libraries automatically remove bindings
        can.bind.call(el, "removed", function() {
            can.unbind.call(el, event, handler);
        })

    });


    var Value = can.Control.extend({
            init: function() {
                if (this.element[0].nodeName.toUpperCase() === "SELECT") {
                    // need to wait until end of turn ...
                    setTimeout($.proxy(this.set, this), 1)
                } else {
                    this.set()
                }

            },
            "{value} change": "set",
            set: function() {
                this.element[0].value = this.options.value()
            },
            "change": function() {
                this.options.value(this.element[0].value)
            }
        })

    var Checked = can.Control.extend({
            init: function() {
                this.isCheckebox = (this.element[0].type.toLowerCase() == "checkbox");
                this.check()
            },
            "{value} change": "check",
            "{trueValue} change": "check",
            "{falseValue} change": "check",
            check: function() {
                if (this.isCheckebox) {
                    var value = this.options.value(),
                        trueValue = this.options.trueValue() || true,
                        falseValue = this.options.falseValue() || false;

                    this.element[0].checked = (value == trueValue)
                } else {
                    if (this.options.value() === this.element[0].value) {
                        this.element[0].checked = true //.prop("checked", true)
                    } else {
                        this.element[0].checked = false //.prop("checked", false)
                    }
                }


            },
            "change": function() {

                if (this.isCheckebox) {
                    this.options.value(this.element[0].checked ? this.options.trueValue() : this.options.falseValue());
                } else {
                    if (this.element[0].checked) {
                        this.options.value(this.element[0].value);
                    }
                }

            }
        });

})(can);