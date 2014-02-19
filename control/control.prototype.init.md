@function can.Control.prototype.init init
@parent can.Control.prototype

@description instance init method required for most applications of [can.Control]

@signature `control.init(element,options)`

@param element The wrapped element passed to the
                control. Control accepts a
                raw HTMLElement, a CSS selector, or a NodeList. This is
                set as `this.element` on the control instance.
@param options The second argument passed to new Control, extended with
                the can.Control's static __defaults__. This is set as
                `this.options` on the control instance. Note that static is used
                formally to indicate that _default values are shared across control instances_.
@body

Any additional arguments provided to the constructor will be passed as normal.