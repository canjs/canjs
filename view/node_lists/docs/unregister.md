@function can.view.nodeLists.register
@parent can.view.nodeLists

Unregister's a nodeList and returns the unregistered nodes.  
Call if the nodeList is no longer being updated. This will 
also unregister all child nodeLists.

@param {Array.<HTMLElement>} nodeList The nodeList to unregister.
@return {Array.<HTMLElement>} nodeList The array of nodes that were unregistered.
