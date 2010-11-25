steal.plugins('jquery/event').then(function($){
	
	
	
	
	var support = $.support;
	support.online = ("onLine" in window.navigator)
	
	
	
	
	//support.offlineEvents = eventSupported("online",document.documentElement)
	$(function(){
		support.onlineEvents = ("ononline" in document.body)
		if(!support.onlineEvents){
			document.body.setAttribute("ononline","")
			support.onlineEvents = ("ononline" in window)
		}
		if(support.onlineEvents){
			return;
		}
		var lastStatus = navigator.onLine;
		setInterval(function(){
			if(lastStatus !== navigator.onLine){
				lastStatus = navigator.onLine
				$(document.body).trigger(lastStatus ? "online" : "offline")
				$(window).triggerHandle(lastStatus ? "online" : "offline")
			}
		},100)

	})
	
	
	
	
})
