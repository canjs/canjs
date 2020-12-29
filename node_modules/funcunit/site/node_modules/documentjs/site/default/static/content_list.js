steal("can/control","jquery","can/observe",function(Control, $){

	var contentList = function(sections, tag){
		var element = $("<"+tag+">");
		$.each(sections, function(i, section){
			$li = $("<li>");
			$a = $("<a>").attr("href","#"+section.id).text(section.text);
			element.append( $li.append($a) );
			
			if(section.sections && section.sections.length) {
				$li.append( contentList(section.sections, tag) );
			}
		});
		return element;
	};

	return can.Control.extend({
		init: function() {
			var sections = [];
	
			this.collectSignatures().each(function(ix) {
				var h2 = $('h2', this);
				this.id = 'sig_' + h2.text().replace(/\s/g,"").replace(/[^\w]/g,"_");
				//this.id = encodeURIComponent(h2.text());
				sections.push({id: this.id, text: h2.text()});
			});
			
			var headingStack = [],
				last = function(){
					return headingStack[ headingStack.length -1 ]
				};
			
			var ch = this.collectHeadings().each(function(ix) {
				var el = $(this);
				this.id = 'section_' + el.text().replace(/\s/g,"").replace(/[^\w]/g,"_");
				var num = +this.nodeName.substr(1);
				var section = {
					id: this.id, 
					text: el.text(),
					num: num,
					sections: []
				};
				
				while(last() && (last().num >= num) ) {
					headingStack.pop();
				}
				
				if(!headingStack.length) {
					sections.push(section);
					headingStack.push(section);
				} else {
					last().sections.push(section);
					headingStack.push(section);
				}	
			});
	
			this.element.html( contentList(sections, 
				( ( window.docObject.outline && window.docObject.outline.tag ) || "ul" ).toLowerCase() ) );
	
			if(window.location.hash.length) {
				var id = window.location.hash.replace('#', ''),
					anchor = document.getElementById(id);

				if(anchor) {
					anchor.scrollIntoView(true);
				}
			}
		},
		collectSignatures: function() {
			var cloned = $('.content .signature').clone();
			// remove release numbers
			cloned.find(".release").remove();
			return cloned;
		},
		collectHeadings: function() {
			var depth = ( window.docObject.outline && window.docObject.outline.depth ) || 1;
			var headings = [];
			for(var i = 0; i  < depth; i++) {
				headings.push("h"+(i+2));
			}
			return $('.content .comment').find(headings.join(","));
		}
	});

});