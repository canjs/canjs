@hide
@function can.view.nodeLists.nestList
@parent can.view.nodeLists

If a given list does not exist in the nodeMap then create an lookup
id for it in the nodeMap and assign the list to it.
If the the provided does happen to exist in the nodeMap update the
elements in the list.

@param {Array.<HTMLElement>} nodeList The nodeList being nested.