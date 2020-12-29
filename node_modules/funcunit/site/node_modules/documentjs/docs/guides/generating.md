@page DocumentJS.guides.generating generating
@parent DocumentJS.guides 3

Learn how to generate your documentation. 

@body

## Generating With Command Line

To generate your docs, if you installed DocumentJS globally, run:

     > documentjs
     
Otherwise, you run:

     > ./node_modules/.bin/documentjs
     
You can specify a version or site to run with:

     > ./node_modules/.bin/documentjs 1.0.0

You can also specify a local repository to find a version with:

     > ./node_modules/.bin/documentjs 1.0.0@../documentjs

### Command Line Options

The command line supports the following options that map to various properties
in [DocumentJS.docConfig], [DocumentJS.projectConfig], or [DocumentJS.siteConfig]:

 - __watch__ - regenerate on changes
 - __forceBuild__ - rebuild templates and static distributable
 - __debug__ - turn on debug messages
 - __help__ - command line information

You can turn on these options with:

    > ./node_modules/.bin/documentjs --watch
   
They are aliased to single characters and groupable so you can turn on watch, forceBuild and
debug like:

    > ./node_modules/.bin/documentjs --wfd

## Generating With Grunt

To generate with grunt run:

    > grunt documentjs
    
This will generate all configured versions and sites. To run a specific site or version
add a `:NAME` where _NAME_ is the version or site name like:

    > grunt documentjs:2.0

You can point a version to a local copy with:

    > grunt documentjs:2.0@../myproject

