/* global window, document, $, Bitovi, prettyPrint, Grayscale */

import 'jquery';
import 'can';
import 'can/construct/super/';
import Bitovi from './bitovi';

import './lib/grayscale';
import './lib/moment';
import './lib/pretty-print';
import './models/';
import Controls from './controls/';

Bitovi.OSS.initTwitterWidgets = function() {
	if($('.twitter-follow-button').length) {
		// replace the "Follow @canjs!" link with a little wiget with follower count.
		$('#twitter-wjs').remove();
		!function (d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (!d.getElementById(id)) {
				js = d.createElement(s);
				js.id = id;
				js.src = '//platform.twitter.com/widgets.js';
				fjs.parentNode.insertBefore(js, fjs);
			}
		}(document, 'script', 'twitter-wjs');
	}
};

Bitovi.OSS.redrawFont = function() {
	var style = $('<style>:before,:after{content:none !important}</style>');
	$('head').append(style);

	window.setTimeout(function() {
		style.remove();
	}, 0);
};


var initControls = function(mappings) {
	can.each(mappings, function(name, selector) {
		$(selector).each(function() {
			var widget = $(this);
			new Controls[name](widget);
		});
	});
};

$(function() {
	Bitovi.OSS.initTwitterWidgets();
	initControls({
		// TODO: re-add this and fix bithub
		// '.social': 'SocialStats',
		'.cdn': 'CDNChooser',
		'.communityTabs': 'CommunityTabs',
		'.sidebar': 'Menu'
	});

	new Controls.Example('.container.example', {});

	// Syntax highlighting
	$('pre code').each(function() {
		var el = $(this).parent();
		el.addClass('prettyprint');
		if(!el.hasClass('nolinenums')) {
			el.addClass('linenums');
		}
	});

	prettyPrint();
});

// feature-test for canvas
var canvas = !!((document.createElement('canvas')).getContext);

if(canvas) {
	// this needs to wait until everything is loaded.
	$(window).load(function() {

		// Grayscaling for our featured apps.
		Grayscale($('.carousel img'), 300);
	});
}
