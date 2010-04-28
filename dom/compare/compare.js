steal.plugins('jquery').then(function($){
	/**
	 * @function compare
	 * Compares the position of two nodes and returns at bitmask detailing how they are positioned 
	 * relative to each other.  You can expect it to return the same results as 
	 * [http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition | compareDocumentPosition].
	 * Parts of this documentation and source come from [http://ejohn.org/blog/comparing-document-position | John Resig].
	 * @plugin dom/position
	 * @param {HTMLElement} a the first node
	 * @param {HTMLElement} b the second node
	 * @return {Number} A bitmap with the following digit values:
	 * <table class='options'>
	 *     <tr><th>Bits</th><th>Number</th><th>Meaning</th></tr>
	 *     <tr><td>000000</td><td>0</td><td>Elements are identical.</td></tr>
	 *     <tr><td>000001</td><td>1</td><td>The nodes are in different documents (or one is outside of a document).</td></tr>
	 *     <tr><td>000010</td><td>2</td><td>Node B precedes Node A.</td></tr>
	 *     <tr><td>000100</td><td>4</td><td>Node A precedes Node B.</td></tr>
	 *     <tr><td>001000</td><td>8</td><td>Node B contains Node A.</td></tr>
	 *     <tr><td>010000</td><td>16</td><td>Node A contains Node B.</td></tr>
	 *     </tr>
	 * </table>
	 */
	jQuery.fn.compare = function(b){ //usually 
	        //b is usually a relatedTarget, but b/c it is we have to avoid a few FF errors
	        
	        try{ //FF3 freaks out
	            b = b.jquery ? b[0] : b;
	        }catch(e){
	            return null;
	        }
			if (window.HTMLElement) { //make sure we aren't coming from XUL element
				var s = HTMLElement.prototype.toString.call(b)
				if (s == '[xpconnect wrapped native prototype]' || s == '[object XULElement]') return null;
			}
			if(this[0].compareDocumentPosition){
	            return this[0].compareDocumentPosition(b);
	        }else if(this[0].contains){
	
	        }
			if(this[0] == document && b != document) return 8;
	        var number = (this[0] !== b && this[0].contains(b) && 16) + (this[0] != b && b.contains(this[0]) && 8);
	        if(this[0].sourceIndex){
	            number += (this[0].sourceIndex < b.sourceIndex && 4)
	            number += (this[0].sourceIndex > b.sourceIndex && 2)
	        }else{
	            range = document.createRange();
	            range.selectNode(this[0]);
	            sourceRange = document.createRange();
	            sourceRange.selectNode(b);
	            compare = range.compareBoundaryPoints(Range.START_TO_START, sourceRange);
	            number += (compare == -1 && 4)
	            number += (compare == 1 && 2)
	        }
	
	        return number;
	}
});