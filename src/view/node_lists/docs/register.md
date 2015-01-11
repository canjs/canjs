@function can.view.nodeLists.register
@parent can.view.nodeLists

Registers a nodeList.

@param {Array.<HTMLElement>} nodeList An array of elements. This array will be kept live if child nodeLists
update themselves.
@param {function} [unregistered] An optional callback that is called when the `nodeList` is
replaced due to a parentNode list being updated.
@param {Array.<HTMLElement>} [parent] An optional parent nodeList.  If no parentNode list is found,
the first element in `nodeList`'s current nodeList will be used.

@return {Array.<HTMLElement>} The `nodeList` passed to `register`.
