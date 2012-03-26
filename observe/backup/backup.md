@page can.Observe.backup 
@parent can.Observe
@plugin can/observe/backup
@test can/observe/backup/qunit.html
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=can/observe/backup/backup.js

You can backup and restore instance data with the can/observe/backup
plugin.

To backup a observe instance call [can.Observe.prototype.backup backup] like:

	var recipe = new Recipe({name: "cheese"});
	recipe.backup()

You can check if the instance is dirty with [can.Observe.prototype.isDirty isDirty]:

	recipe.name = 'blah'
	recipe.isDirty() //-> true

Finally, you can restore the original attributes with 
[can.Observe.prototype.backup backup].

	recipe.restore();
	recipe.name //-> "cheese"

See this in action:

@demo can/observe/backup/backup.html

*Note: Its important to include this plugin before you include other plugins that 
extend Observe so that prototype chain is extended correctly.