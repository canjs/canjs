@function can-bind.prototype.updateParent updateParent
@parent can-bind.prototype
@description Set the parent’s value as if the child had changed.
@hide
@signature `binding.updateParent(newValue)`
@param {*} newValue The parent’s new value.

This method sets the parent’s value if it is not currently in an update cycle
and the parent’s current value doesn’t already match the new value.

Additionally, if the `sticky` option is set to `"childSticksToParent"`, the
parent’s value is checked _after_ it’s set; if it doesn’t match the child’s
value, then the child is set to the parent’s new value. This is useful in cases
where the parent might change its own value after being set.
