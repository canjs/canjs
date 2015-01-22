@function can.view.parser

Parse HTML and mustache tokens.


@body

    can.view.parser("<h1> ....", {
    	start:     function( tagName, unary ){},
		end:       function( tagName, unary ){},
		close:     function( tagName ){},
		attrStart: function( attrName ){},
		attrEnd:   function( attrName ){},
		attrValue: function( value ){},
		chars:     function( value ){},
		comment:   function( value ){},
		special:   function( value ){},
		done:      function( ){}
    })
