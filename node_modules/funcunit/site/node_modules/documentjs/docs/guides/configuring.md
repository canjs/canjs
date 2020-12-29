@page DocumentJS.guides.configuring configuring
@parent DocumentJS.guides 1

Learn how to configure the `documentjs.json` file for your project.

@body

In the root folder of your project, a `documentjs.json` file is used to configure your project's
documentation. [DocumentJS.docConfig docConfig] specifies the high-level structure and options allowed in
the `documentjs.json` file. There are a lot of options.  This guide walks you through the 
most common setups.


## Configuring for multiple versions using github pages

This configuration assumes you:

- Are using github pages to host your code's documentation.
- Have [DocumentJS.guides.installing installed] as an npm dependency.

You will setup the code of your project to be documented and then
setup an empty `gh-pages` branch to download and document that code.

1. Create a `documentjs.json` file in your project's root folder.

   Specify a [DocumentJS.siteConfig site] that will find your project's
   documented files and generate them within a folder. The following will get all `.md` and
   `.js` files in the `lib` and `docs` folders and put them in an `api` folder
   next to your project's folder:
   
        {
          "sites": {
            "api": {
              "glob": "{lib,docs}/**/*.{js,md}"
            }
          }
        }

   Run [DocumentJS.apis.generate.documentjs documentjs] and 
   check that the output looks like:
   
        project> ./node_modules/.bin/documentjs
        project> cd ../api
        api> open index.html
        
   Make sure to commit and push your project's `documentjs.json` file.

2. Create and clone a gh-pages branch.

   Create the branch:

        project> git checkout --orphan gh-pages
    
   Remove files not needed in the static
   site. Commit and push the branch:
    
        project> git rm -rf .
        project> touch documentjs.json
        project> git add documentjs.json
        project> git commit -m "first commit"
        project> git push origin gh-pages
        
   Clone the branch so you don't have to switch back and forth constantly:
   
        project> cd ..
        dev> git clone -b gh-pages git://github.com/org/project project.com
        dev> cd project.com
        

3. [DocumentJS.guides.installing Install DocumentJS as an npm dependency]

        project.com> npm install documentjs --save-dev
   
4. Create a gh-pages `documentjs.json` file.

   List the version number of your project and the branch where
   you added the first `documentjs.json`:
   
        {
          "versions": {
            "1.0.0": "git://github.com/org/project#master"
          }
        }

   By default, this will download the `master` into _project.com/1.0.0/project_
   and then run its `documentjs.json`, 
   creating _project.com/1.0.0/api/index.html_.  For stable linking and SEO, you
   likely want your most recent production documentation 
   in the same place.  For example, you might always want the latest production
   API docs at _project.com/api/index.html_.  The `defaultVersion` lets you specify
   a version that should get put in that location.  
   
   Set `defaultVersion` to the version number of your project:
   
        {
          "versions": {
            "1.0.0": "git://github.com/org/project#master"
          },
          "defaultVersion": "1.0.0"
        }
   
   Checkout [DocumentJS.docConfig docConfig's documentation] for how to change the location
   of the default version, and change the location of other versions, and add
   other behaviors.

5. Generate the docs.

   Use [DocumentJS.apis.generate.documentjs documentjs] to generate 
   the docs:
   
       project.com> ./node_modules/.bin/documentjs
   
   This will download all versions and generate their docs. This isn't ideal if 
   you are trying to document a single version.  You would have to commit and
   push to see changes.  Instead, you can swap a specific version to be read from
   the filesystem like:
   
       project.com> node_modules/.bin/documentjs 1.0.0@../documentjs
       
   This will use the local documentjs folder as the 1.0.0 version.
   
## Configuring for a simple single version.

Coming soon.