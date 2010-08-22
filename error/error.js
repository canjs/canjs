steal.plugins('jquery/class', 'jquery').then(function(){

	if (true || steal.options.env == 'production') {
		var seconds_remaining;
		var timer;
		
		$.ApplicationError = {
			textarea_text: "type description here",
			textarea_title: "Damn It!",
			close_time: 10,
			url: 'https://damnit.jupiterit.com',
			prompt_text: "Something just went wrong.  Please describe " +
			"your most recent actions and let us know what " +
			"happened. We'll fix the problem.",
			prompt_user: true,
			generate_content: function( params ) {
				var content = [];
				// intentionally put HTML Content at the end
				for (var attr in params) {
					if (params.hasOwnProperty(attr) && attr != 'toString' && attr != 'HTML Content') 
						content.push(attr + ':\n     ' + params[attr]);
				}
				if (params['HTML Content']) 
					content.push('HTML Content' + ':\n     ' + params['HTML Content']);
				return content.join('\n');
			},
			config: function( params ) {
				$.extend($.ApplicationError, params);
			},
			create_send_function: function( error ) {
				$.ApplicationError.send = function(ev){
					var params = {
						error: {}
					}, description = $('#_error_text');
					params.error.subject = error.subject;
					if (description.length) 
						error['User Description'] = description.val();
					if ($.ApplicationError.prompt_user) {
						$.ApplicationError.pause_count_down();
						document.body.removeChild($('#_application_error')[0]);
					}
					params.error.content = $.ApplicationError.generate_content(error);
					ev.stopPropagation();
					ev.preventDefault();
					params.user_crypted_key = APPLICATION_KEY;
					params.referer = location.href;
					params._method = "POST";
					$.ajax({
						url: $.ApplicationError.url + "/errors.json",
						dataType: "jsonp",
						data: params
					})
				};
			},
			create_dom: function( error ) {
				if ($('#_application_error').length) return;
				var div = $('<div />').attr('id', '_application_error').css({
					position: $.browser.mozilla ? 'fixed' : 'absolute',
					bottom: '0px',
					left: '0px',
					margin: '0px'
				})
				var title = $('<div />').addClass('ui-corner-top').addClass('ui-state-error').css({
					padding: '0px 5px 0px 10px'
				})
				
				var a = $('<a />').css({
					'float': 'right',
					width: 50,
					'text-decoration': 'underline',
					color: 'Red',
					'padding-left': 25,
					'font-size': '8pt',
					cursor: 'pointer'
				}).click($.ApplicationError.send).html('Close')
				var span = $('<span />').attr('id', '_error_seconds').css({
					'float': 'right',
					'font-size': '8pt'
				}).after(this.textarea_title);
				
				title.append(a).append(span).append('<span>' + this.textarea_title + '</span>');
				
				var form = $('<form />').attr('id', '_error_form').addClass('ui-state-highlight ')
				.submit($.ApplicationError.send).css({
					padding: 0,
					margin: 0,
					font: 'normal 8pt verdana'
				});
				
				var form_div = $('<div />').css({
					'float': 'left',
					width: 300,
					'margin-left': $.browser.msie ? 5 : 10
				}).html(this.prompt_text)
				var input = $('<button />').addClass('ui-button').addClass('ui-state-default')
					.addClass('ui-widget').addClass('ui-state-default').addClass('ui-corner-all')
					.addClass('ui-button-text-only').css({
						'float': 'right',
						margin: '17px 5px 0px 0px'
					}).append('<span>Send</span>')
				var input2 = $('<input />').attr({
					type: 'submit',
					value: 'Send'
				})
				var textarea = $('<textarea />').css({
					width: 335,
					color: 'gray'
				}).attr({
					rows: $.browser.mozilla ? 2 : 3,
					name: 'description',
					id: '_error_text'
				}).focus(function(){
					var area = $('#_error_text');
					if (area.val() == $.ApplicationError.textarea_text) 
						area.val('');
					area.css('color', 'black');
					$.ApplicationError.pause_count_down();
				}).html(this.textarea_text)
				form.append(form_div).append(input.after(textarea));
				
				div.append(title).append(form);
				$(document.body).append(div);
				this.set_width();
			},
			notify: function( e ) {
				e = $.ApplicationError.transform_error(e);
				$.extend(e, {
					'Browser': navigator.userAgent,
					'Page': location.href,
					'HTML Content': document.documentElement.innerHTML.replace(/\n/g, "\n     ").replace(/\t/g, "     ").substring(0, 5000)
				});
				if (Error && new Error().stack) 
					e.Stack = new Error().stack;
				if (!e.subject) 
					e.subject = 'ApplicationError on: ' + window.location.href;
				this.create_send_function(e);
				if ($.ApplicationError.prompt_user == true) 
					this.create_dom(e);
				else 
					this.send();
				return false;
			},
			set_width: function() {
				var cont = $('#_application_error'), width;
				if (!cont.length) 
					return;
				width = $(document.body).outerWidth(true);
				cont.width(width);
				$('#_error_text').width(width - 400);
			},
			transform_error: function( error ) {
				if (typeof error == 'string') {
					var old = error;
					error = {
						toString: function() {
							return old;
						}
					};
					error.message = old;
				}
				if ($.browser.opera && error.message) {
					var error_arr = error.message.match('Backtrace');
					if (error_arr) {
						var message = error.message;
						error.message = message.substring(0, error_arr.index);
						error.backtrace = message.substring(error_arr.index + 11, message.length);
					}
				}
				return error;
			},
			count_down: function() {
				seconds_remaining--;
				$('#_error_seconds').html('This will close in ' + seconds_remaining + ' seconds.');
				if (seconds_remaining == 0) {
					$.ApplicationError.pause_count_down();
					$.ApplicationError.send();
				}
			},
			start_count_down: function() {
				seconds_remaining = this.close_time;
				$('#_error_seconds').html('This will close in ' + seconds_remaining + ' seconds.');
				timer = setInterval($.ApplicationError.count_down, 1000);
			},
			pause_count_down: function() {
				clearInterval(timer);
				timer = null;
				$('#_error_seconds').html('');
			}
		};
		
		//$.ApplicationError.start_count_down();
		
		var oldCB = jQuery.Class.callback;
		jQuery.Class.callback = function(f_names){
			var oldCBFunc = oldCB.apply(this, arguments), newCBFunc = function(){
				try {
					return oldCBFunc.apply(this, arguments);
				} 
				catch (e) {
					e = $.ApplicationError.transform_error(e);
					
					$.extend(e, {
						'Controller': instance.klass.className,
						'Action': action_name,
						subject: 'Dispatch Error: ' + ((e.message && typeof(e.message) == 'string') ? e.message : e.toString())
					});
					$.ApplicationError.notify(e);
					return false;
				}
			}
			return newCBFunc;
		}
		
		$(window).resize($.ApplicationError.set_width)
		$(window).error(function(msg, url, l){
			var e = {
				message: msg,
				fileName: url,
				lineNumber: l
			};
			$.ApplicationError.notify(e);
			return false;
		})
		$('head').append('<link rel="stylesheet" href="'+steal.root.path+
			(steal.root.path == "/"? '': '/') +'phui/smoothness/jquery-ui-1.7.2.custom.css" type="text/css" />');
	}
})