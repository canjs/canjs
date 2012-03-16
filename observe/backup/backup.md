@page can.Observe.backup 
@parent can.Observe
@plugin can/observe/backup
@test can/observe/backup/qunit.html
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=can/observe/backup/backup.js

You can backup and restore instance data with the can/observe/backup
plugin.

To backup a observe instance call [can.Observe.prototype.backup backup] like:

@codestart
var recipe = new Recipe({name: "cheese"});
recipe.backup()
@codeend

You can check if the instance is dirty with [can.Observe.prototype.isDirty isDirty]:

@codestart
recipe.name = 'blah'
recipe.isDirty() //-> true
@codeend

Finally, you can restore the original attributes with 
[can.Observe.prototype.backup backup].

@codestart
recipe.restore();
recipe.name //-> "cheese"
@codeend

See this in action:

@demo can/observe/backup/backup.html
