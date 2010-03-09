steal.plugins("jquery",'jquery/lang/rsplit').then(function($) {
var isNumber = function(value) {
   if(typeof value == 'number') return true;
   if(typeof value != 'string') return false;
   return value.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/);
};
/**
 *  @add jQuery.fn
 */

$.fn.extend({
    /**
     * Returns an object of name-value pairs that represents values in a form.  
     * It is able to nest values whose element's name has square brackets. <br/>
     * Example html:
     * @codestart html
     * &lt;form>
     *   &lt;input name="foo[bar]" value='2'/>
     *   &lt;input name="foo[ced]" value='4'/>
     * &lt;form/>
     * @codeend
     * Example code:
     * @codestart
     * $('form').formParams() //-> { foo:{bar:2, ced: 4} }
     * @codeend
     * @param {optional:Boolean} numAsString true if all values should be left as strings
     * @return {Object} An object of name-value pairs.
     */
    formParams: function(numAsString) {
       var data = {};
       if(this[0].nodeName.toLowerCase() == 'form' && this[0].elements){

           return jQuery( jQuery.makeArray(this[0].elements) ).getParams(numAsString);
       }
       return jQuery("input, textarea, select", this[0]).getParams(numAsString);
    },
    getParams : function(numAsString){
        var data = {};
        this.each(function(){
            var el = this;
            if(el.type && el.type.toLowerCase()=='submit') return;
            var key = el.name, key_components = $.String.rsplit(key, /\[[^\]]*\]/), value;
            /* Check for checkbox and radio buttons */
            switch(el.type ? el.type.toLowerCase() : el.nodeName.toLowerCase()) {
            case 'checkbox':
            case 'radio':
             value = !!el.checked;
             break;
            default:
             value = el.value;
             break;
            }
            if(!numAsString && isNumber(value) ) value = parseFloat(value);
            if( key_components.length > 1 ) {
             var last = key_components.length - 1,nested_key = key_components[0].toString();
             if(! data[nested_key] ) data[nested_key] = {};
             var nested_hash = data[nested_key];
             for(var k = 1; k < last; k++){
                nested_key = key_components[k].substring(1, key_components[k].length - 1);
                if( ! nested_hash[nested_key] ) nested_hash[nested_key] ={};
                nested_hash = nested_hash[nested_key];
             }
             nested_hash[ key_components[last].substring(1, key_components[last].length - 1) ] = value;
            } else {
             if (key in data) {
                if (typeof data[key] == 'string' ) data[key] = [data[key]];
                data[key].push(value);
             }
             else data[key] = value;
            }
        })
        return data;
    }
}



);





});