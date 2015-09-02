@function can.stache.registerSimpleHelper registerSimpleHelper
@description Register a helper.
@parent can.stache.static

@signature `can.stache.registerSimpleHelper(name, helper)`
@param {String} name The name of the helper.
@param {can.stache.simplehelper} helper The helper function.

@body

Registers a helper with the Mustache system that always returns
the arguments value (instead of a compute).
Pass the name of the helper followed by the
function to which Mustache should invoke.
These are run at runtime.
