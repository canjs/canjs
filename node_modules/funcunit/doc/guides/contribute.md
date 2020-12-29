@page Guides.contributing Contributing
@parent Guides 8

@body


## Overview

FuncUnit is managed by the [DoneJS Contributors Team](https://donejs.com/About.html#section=section_Team).
All contributions from all types of contributors are welcome. Contributing
to an Open Source project can be an intimidating experience.  We're
committed to making the experience as pleasant and rewarding as possible.  We're happy to setup a
pairing session to show you how to fix a bug or write a feature.  

If you have any questions, you can always reach us on [Slack](https://www.bitovi.com/community/slack).


## Report a bug

FuncUnit uses [Github Issues](https://github.com/bitovi/funcunit/issues/new) to track bugs.

When creating an issue, it's very helpful to include:

 - Small examples using tools like JSBin.
 - Breaking unit tests (optional).
 - Proposed fix solutions (optional)

Also, please search for previous tickets.  If there's something similar, add to that, or
give it a `+1`.

Finally, if there are any questions, reach out to
us on the [Bitovi forums](https://forums.bitovi.com/c/testing) or talk to us on
[Slack](https://www.bitovi.com/community/slack).

### Priority, Tags, and Complexity

The [core team](https://donejs.com/About.html#section=section_Team) reviews issues
and assigns them a `P0` to `P4` tag corresponding to the following priorities:

- `P0` - An issue that will preempt any other issues currently being worked on.
- `P1` - A critical feature or bug that needs to be fixed to keep CanJS's high degree of quality.
- `P2` - A feature or bug that is less likely to be encountered, but something we intend to get to.
- `P3` - A nice to have. The OS team might get to it, but it's helpful if the community assists.
- `P4` - A nice to have that the OS team will accept, but will be unlikely to prioritize any effort towards.

There are several ways to influence these priorities:

 - Offer to pair with a contributor on a solution.
 - Write a good test.
 - Come to a DoneJS Contributors meeting and make your case.
 - Get others from other organizations to `+1` the issue.
 - Make your case on [Slack](https://www.bitovi.com/community/slack) with a contributor or in the issue.
 - You can always hire [Bitovi](https://www.bitovi.com) or a contributor to make the change.


Also, the core team will often include a complexity indicator in the title that looks like
`~NUMBER`.  This is a fibonacci number.  `~1` means its an extremely simple task.  `~8` is about
a half day task.  `~34` might take a week of experimentation.


## Suggest a feature

FuncUnit uses [Github Issues](https://github.com/bitovi/funcunit/issues/new) to track feature requests.

When creating an feature issue, it's very helpful to include:

 - Examples of what using the feature will look like.
 - Benefits and drawbacks of the feature.
 - Why the feature is important.
 - Any implementation details around the feature.

Here are some examples of well-written feature requests:

 - [Make events fire asynchronously and dispatched during request animation frame or setImmediate](https://github.com/canjs/can-event/issues/11)
 - [Modify key -> argument behavior in stache](https://github.com/canjs/canjs/issues/1699)

Also, please search for previous feature requests.  If there's something similar, add to that, or
give it a `+1`.

Finally, if there are any questions, reach out to
us on the [Bitovi forums](https://forums.bitovi.com/c/testing) or talk to us on
[Slack](https://www.bitovi.com/community/slack).

### Priority, Tags, and Complexity

The [core team](https://donejs.com/About.html#section=section_Team) reviews issues
and assigns them a `P0` to `P4` tag corresponding to the following priorities:

- `P0` - An issue that will preempt any other issues currently being worked on.
- `P1` - A critical feature or bug that needs to be fixed to keep CanJS's high degree of quality.
- `P2` - A feature or bug that is less likely to be encountered, but something we intend to get to.
- `P3` - A nice to have. The OS team might get to it, but it's helpful if the community assists.
- `P4` - A nice to have that the OS team will accept, but will be unlikely to prioritize any effort towards.

There are several ways to influence these priorities:

 - Offer to pair with a contributor on a solution.
 - Write a good test.
 - Come to a DoneJS Contributors meeting and make your case.
 - Get others from other organizations to `+1` the issue.
 - Make your case on [Slack](https://www.bitovi.com/community/slack) with a contributor or in the issue.
 - You can always hire [Bitovi](https://www.bitovi.com) or a contributor to make the change.


Also, the core team will often include a complexity indicator in the title that looks like
`~NUMBER`.  This is a fibonacci number.  `~1` means its an extremely simple task.  `~8` is about
a half day task.  `~34` might take a week of experimentation.


## Code changes

Contributing to any Open Source project can be intimidating.  All contributions from all types of contributors are welcome.  We're
committed to making the experience as pleasant and rewarding as possible.  We're happy to setup a
pairing session to show you how to fix a bug or write a feature.  

If you have any questions, you can always reach us on [Slack](https://www.bitovi.com/community/slack).


### Setting up your development environment.

Developing FuncUnit requires:

 - A [https://github.com/](github.com) account and git client.
 - Node version 4 or later.
 - Firefox for running automated tests.

#### Getting github account and client

Signup for a [https://github.com/](GitHub) account.  

There are a variety of ways to get a git command line client
connected to your GitHub account.  Fortunately, GitHub has
great documentation on how to [Setup Git](https://help.github.com/articles/set-up-git/).


If you already have `git` installed, make sure you've
[setup your ssh keys](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/).

#### Get NodeJS

Download Node.js version 4 or later at [https://nodejs.org](https://nodejs.org).  You can
verify node is working at its version with:

```
> node -v
```

#### Get Firefox

Download the Firefox browser
[here](https://www.mozilla.org/en-US/firefox/new/). Make sure it gets installed into the
default location for your operating system.

Firefox is used to run each repository's tests.


### Getting the code and verify it is working

Once your environment is setup, you should be able to clone the repository you
want to change, install its dependencies, and verify you've setup your
development environment correctly.

__1.__  Fork the repository you are working from by clicking the `fork` button.


__2.__ Clone the your forked version of the repository.

```
> git clone git@github.com:<your username>/<repository-name>.git
```

For example, if your username is `justinbmeyer`, and you forked `funcunit`:

```
> git clone git@github.com:justinbmeyer/funcunit.git
```

Before the next step, make sure you move into your project's directory.  For example:

```
> cd funcunit
```

__3.__ Install npm dependencies with:

```
> npm install
```

__4.__ Make sure Firefox is closed and run the test suite with:

```
> npm test
```

If every test passed, __congrats__! You have everything you need to
change code and send it back to us.

### File organization and responsibilities

Understanding the file structure can help you figure out what code needs to be changed.  
The following details the directory structure of FuncUnit:

```
├── package.json            - Configuration of package and dev scripts
├── funcunit.js 	          - Main module code
├── build.js                - Build script to export code in other formats
├── .editorconfig           - Configures editors for this project
├── .gitignore              - Tells git to ignore certain files
├── .jshintrc               - Configures JSHint
├── .npmignore              - Tells npm publish to ignore certain files
├── .travis.yml             - Travis CI configuration
├── publish-docs.js         - Publishes the documentation to gh-pages
├── readme.md               - Automatically generated readme
├── test.html               - Main test page
├── test/                   - Test files
|   ├── test.js 						- Main test file
|   ├── *       						- Other files and folders for tests go in this folder
├── browser/                - core FuncUnit files
├── doc/                    - Documentation source
|   ├── guides/             - Guide documentation files
├── node_modules/           - Node dependency installation folder
├── site/                   - Files hosted via gh-pages in github
```

Generally, speaking, the most important files are:

 - the main module -  `funcunit.js`
 - the main test module - `test/test.js`
 - the test page - `test.html`

When fixing a bug or making a feature, we'll add a test in the main test module
and update code in the main module and verify the tests are passing by running
the test page.

Where possible, FuncUnit code is:

- Tabs not spaces
- JSHinted
- CommonJS not ES6
- Follows jQuery [coding conventions](https://contribute.jquery.org/style-guide/js/)


###  Make your changes

Once you've figured out where you need to make changes, you'll want to complete the following steps
to make those changes and create a pull request so we can include your code in future releases:


1. Create a new feature branch. For example, `git checkout -b html5-fix`.
2. Make some changes to the code and tests.
4. Run tests `npm test` and make sure they pass in all browsers.
5. Update documentation if necessary.
6. Push your changes to your remote branch.  For example, `git push origin html5-fix`.
7. Submit a pull request! Navigate to Pull Requests and click the 'New Pull Request' button. Fill in some
	details about your potential patch including a meaningful title. When finished, press "Send pull request". The core team will be notified about your submission and let you know of any problems or targeted release date.

If you enjoy making these kinds of fixes, and want to directly influence CanJS's direction,
consider joining our [Core team](https://donejs.com/About.html#section=section_Coreteam).


## Documentation improvements

The FuncUnit site is generated with [DocumentJS](https://documentjs.com).  Its
content is hosted using Github pages publishing the [bitovi/funcunit#gh-pages](https://github.com/bitovi/funcunit/tree/gh-pages) repo.

DocumentJS reads JavaScript comments and markdown files within the `funcunit`.

The guides content for the site is within the `funcunit/doc` folder.

## Generate the documentation locally

To generate the CanJS site:

1. Clone [https://github.com/bitovi/funcunit.git](bitovi/funcunit)

	```
	> git clone git@github.com:bitovi/funcunit
	```

2. Install dependencies:

	```
	> npm install
	```

3. Run `documentjs`:

	```
	> ./node_modules/.bin/documentjs
	```

This should produce a static site in your `funcunit` folder.  Open `funcunit/index.html`
and you should see the site.  You might want to use `http-server` to start
a simple static file server.

### Improve the theme's design and styles

The FuncUnit theme is in `funcunit/site/theme`


### Publish the documentation

Once the docs look right locally, commit your changes, then run:

```shell
npm run document:publish
```

The `publish-docs.js` script will generate the documentation again and push out the `gh-pages` branch.


### Writing API documentation

Our documentation is modeled off of jQuery's.  Please read
their [guidelines](https://github.com/jquery/api.jquery.com/blob/master/README.md). Also read our
[guides/api].

Generally speaking there are three parts to every documentation page:

 - Its description
 - Its signatures
 - The body (typically "Use" section)

#### Description

The description section should be a one or two sentence explanation of what this
piece of documentation does from a _user_ centric view.  Descriptions are a quick summary
of the __why__ and the __what__. It should take on an
active voice.  For example, [can-component]'s description:

> Create a custom element that can be used to manage widgets or application logic.

Notice that it uses "Create" not "Creates".

#### Signatures

Signatures are the __what__ and the __how__.  They should include all or most of the following:

 - __What the signature does__, if different from the description, especially if there are
	multiple signatures.
 - High level details on __how the code works__.
 - A simple example showing __how to use the code__.

[can-compute]'s first signature is a good example of this. First, it explains
__what that signature does__:

> Create a compute that derives its value from other observables.

Then it briefly explains __how the code works__:

> Uses can-observation to call the getterSetter and track observables.

Finally, it provides minimal sample code:

```js
var age = compute(32);

var nameAndAge = compute(function(){
	 return "Matthew - " + age();
});

nameAndAge() // -> "Matthew - 32"

age(33);

nameAndAge() // -> "Matthew - 33"
```

Not all signatures need to hit all three points.  For example [can-event/batch/batch]'s
signature simply adds a bit more depth to the purpose of [can-event/batch/batch]
and then details __how the code works__.  __How to use the code__ is
left for the `body` section as importing the module is not necessary to show.



Signature titles should follow jQuery's conventions:

 - Static methods like: `TypeAlias.method()`
 - Prototype methods like: `typeAlias.method()`
 - Spaces in between arguments: `typeAlias.method( arg1, arg2 )`
 - Brackets around optional args: `typeAlias.method( arg1 [, arg2 ], arg3 )` or
	`typeAlias.method( arg1 [, arg2 ][, arg3 ] )`

Make sure to fully document the a signature's parameters and return
value.  There's a lot of flexibility in documenting the [type expression](https://documentjs.com/docs/documentjs.typeExpression.html) of
a return value or parameters and the [name expression](https://documentjs.com/docs/documentjs.nameExpression.html) of
parameters.

 - Parameter and descriptions should start with a `Capital` and end with a period like:
	`@param {Type} name Indicates that something should happen.`



#### body

Most body sections start with an `## Use`.  They should be a mini guide on
how to use that piece of code.  Modules should have long bodies that span
multiple topics.  For example [can-component]'s body has examples and
information about nearly all of its sub-functions.  However
[can-component.prototype.tag can-component.prototype.tag] doesn't have a
use section because it's covered in [can-component].


#### structuring documentation

- Group names (like `prototype`) should be lower case.
- Types should be capitalized `{String}` except when they are describing a function [can-fixture.requestHandler].


## Releases - Maintaining FuncUnit

### Making a release

#### For individual modules

FuncUnit has the same structure as all CanJS individual modules which allows making releases through npm scripts.
All versions should follow the [Semantic Versioning](http://semver.org/) guidelines in the form of `MAJOR.MINOR.PATCH` for

- `MAJOR` version when you make incompatible API changes,
- `MINOR` version when you add functionality in a backwards-compatible manner, and
- `PATCH` version when you make backwards-compatible bug fixes.

To make a release we have to make sure to be on the `master` branch and the latest upstream changes and reinstall the latest version of all Node modules:

```
git checkout master
git fetch --all && git rebase
npm cache clean
rm -rf node_modules
npm install
```

Now we can run `npm run release:<versiontype>`. For example, to make a `PATCH` release:

```
npm run release:patch
```

This will run the tests, build, bump the version number accordingly and publish the module to [npm](https://www.npmjs.com/).

### Continuous integration

#### Travis

All repositories automatically run their tests in [Travis CI](https://travis-ci.org/) using the `npm test` command (browser tests use Firefox as their target browser).
