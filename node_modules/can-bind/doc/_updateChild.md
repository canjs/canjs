@function can-bind.prototype.updateChild updateChild
@parent can-bind.prototype
@description Set the child’s value as if the parent had changed.
@hide
@signature `binding.updateChild(newValue)`
@param {*} newValue The child’s new value.

This method sets the child’s value in a batch and increments the semaphore used
to keep track of whether the parent should update when the child changes.

This method adds a task to the `mutateQueue` to be notified of when changes have
stopped; when they have, the semaphore is decremented.
