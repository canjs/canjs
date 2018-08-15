@page guides/contributing/developing-locally Developing Locally
@parent guides/contribute 4
@outline 2

@description Learn how to set up your development environment, get the code, and verify that it’s working.

@body

This page will walk you through setting up the [main CanJS repository](https://github.com/canjs/canjs) on your computer. Remember that CanJS is [guides/contributing/project-organization split into multiple repositories], but you can apply the same general steps to set up any of the other repos.

We’ll cover the following details in this guide:

- Setting up your development environment.
- Getting the repository’s code and verify it’s working.

The following video walks through most of the following steps:

<iframe width="560" height="315" src="https://www.youtube.com/embed/PRuueWqnpIw" frameborder="0" allowfullscreen></iframe>

## Setting up your development environment

Developing CanJS requires:

 - A [GitHub](https://github.com/) account and git client.
 - Node.js version 5 or later.
 - Firefox for running automated tests.

### Sign up for GitHub and set up Git

If you don’t already have a GitHub account, you’ll need to [create a new one](https://help.github.com/articles/signing-up-for-a-new-github-account/).

There are a variety of ways to get a git command line client
connected to your GitHub account. GitHub has
great documentation on how to [set up Git](https://help.github.com/articles/set-up-git/).

If you already have `git` installed, make sure you’ve
[set up your ssh keys](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/).

### Install Node.js

Download Node.js version 5 or later at [NodeJS.org](https://nodejs.org).  You can
verify Node’s version with:

```
node -v
```

### Install Firefox

Firefox is used to run the repository’s tests.

If you don’t already have it, [download Firefox](https://www.mozilla.org/en-US/firefox/new/).
Mozilla has guides for installing it on [Linux](https://support.mozilla.org/en-US/kb/install-firefox-linux),
[Mac](https://support.mozilla.org/en-US/kb/how-download-and-install-firefox-mac),
and [Windows](https://support.mozilla.org/en-US/kb/how-download-and-install-firefox-windows).
Make sure it gets installed into the default location for your operating system.

## Getting the code and verifying that it’s working

Once your environment is set up, you should be able to clone the repository you
want to change, install its dependencies, and verify you’ve set up your
development environment correctly.

### Forking and cloning the repository

A “fork” is a copy of a repository in your personal GitHub account. “Cloning” is the process of getting the repository’s source code on your computer.

GitHub has a [forking guide](https://help.github.com/articles/fork-a-repo/) and a [cloning guide](https://help.github.com/articles/cloning-a-repository/) that explains how to clone a repo on Linux, Mac, or Windows.

To start, click the __Fork__ button to fork the repository from which you will be working.
For example, you can fork [can-compute](https://github.com/canjs/can-compute) by pressing its __Fork__ button on GitHub:

<img src="../../../docs/can-guides/contribute/fork.png" width="600px"/>

Next, you’ll want to clone your forked version of the repository. GitHub’s guide will [instruct you](https://help.github.com/articles/fork-a-repo/#step-2-create-a-local-clone-of-your-fork) to clone it with a command like:

```shell
git clone git@github.com:<your username>/<repository-name>.git
```

For example, if your username is `justinbmeyer` and you forked `can-compute`:

```shell
git clone git@github.com:justinbmeyer/can-compute.git
```

Before continuing, move into your project’s directory. For example:

```shell
cd can-compute
```

### Installing the dependencies

Now install the project’s dependencies with npm:

```shell
npm install
```

### Running the tests

Make sure Firefox is closed and run the test suite with:

```shell
npm test
```

> NOTE: When adding tests, make sure you check out [can-test-helpers](https://github.com/canjs/can-test-helpers) as it provides some useful helpers for some tests.

If every test passed, __congrats__! You have everything you need to
change code and have the core team review it.

### Building the documentation

The [main CanJS repo](https://github.com/canjs/canjs) contains [CanJS.com](https://canjs.com/).

To build the site, run:

```shell
npm run document
```

This should produce a static site in your `canjs` folder.
[`npm run`](https://docs.npmjs.com/cli/run-script) will look for the `document`
script in the repository’s [`package.json`](https://github.com/canjs/canjs/blob/master/package.json)
and run it.

### Viewing the site

After you build the site, your `canjs` repository will now also contain the website.

To view the site, we recommend you install [http-server](https://www.npmjs.com/package/http-server).

```shell
npm install http-server -g
```

After it’s installed, you can start a server in the current directory:

```shell
http-server
```

`http-server` will tell you where you can go in your browser to see the site. It will be something like [http://127.0.0.1:8080].

## Making your changes

Next, learn about [guides/contributing/code making changes and submitting a pull request].
