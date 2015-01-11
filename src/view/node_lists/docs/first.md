@function can.view.nodeLists.first
@parent can.view.nodeLists

Return the first HTMLElement in a nodeList, if the first
element is a nodeList, returns the first HTMLElement of
the child list, etc.

@param {Array.<HTMLElement>} nodeList The nodeList to get the first element of.
@return {HTMLElement} firstElement The first `HTMLElement` in the list.
