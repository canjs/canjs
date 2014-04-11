@function can.view.nodeLists.last
@parent can.view.nodeLists

Return the last HTMLElement in a nodeList, if the last
element is a nodeList, returns the last HTMLElement of
the child list, etc.

@param {Array.<HTMLElement>} nodeList The nodeList to get the last element of.
@return {HTMLElement} lastElement The last `HTMLElement` in the list.
