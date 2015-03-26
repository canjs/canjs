@page Using Setting up CanJS
@parent guides 2

CanJS is designed and packaged so that it can easily fit into your development workflow. You can use it with [jQuery](http://jquery.com), [Dojo](http://dojotoolkit.org/), [Mootools](http://mootools.net/), [YUI](http://yuilibrary.com/) and [Zepto](http://zeptojs.com/). The following pages contain guides on

- [using-download Download] - How to get CanJS using the [big download](using-download.html#section_TheCanJSdownload), a [customized build](using-download.html#section_Thedownloadbuilder), [Bower](using-download.html#section_Bower) or our [CDN](using-download.html#section_TheGitHubCDN)
- [using-loading Loading] - How to load CanJS via a [script tag](using-loading.html#section_Ina_script_tag), [AMD](using-loading.html#section_AMD) (RequireJS) or [StealJS](using-loading.html#section_StealJS)
- [using-production In Production] - Tips on how to set up CanJS in a production environment.
- [using-examples Examples] - Some examples on how it all works combined

If you are looking for a quick start using our [CDN]() just create an HTML page like this:

```
<html>
<head>
	<title>CanJS Test</title>
</head>
<body>
	<script src="libs/jquery.js"></script>
	<script src="http://canjs.com/release/latest/can.jquery.js"></script>
	<script type="text/javascript">
		$(function() {
			// Your CanJS code here
		});
	</script>
</body>
</html>
```

Or fork one the [JSFiddle](http://jsfiddle.com) with your library of choice:

  - [jQuery](http://jsfiddle.net/donejs/qYdwR/)
  - [Zepto](http://jsfiddle.net/donejs/7Yaxk/)
  - [Dojo](http://jsfiddle.net/donejs/9x96n/)
  - [YUI](http://jsfiddle.net/donejs/w6m73/)
  - [Mootools](http://jsfiddle.net/donejs/mnNJX/)
