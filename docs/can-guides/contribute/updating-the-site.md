@page guides/contributing/updating-the-site Updating the Site
@parent guides/contribute 4
@outline 2
@description How to update the CanJS website.

@body

v3.canjs.com is hosted on [GitHub pages](https://pages.github.com/) from the [canjs/3.x#gh-pages](https://github.com/canjs/3.x/tree/gh-pages) branch and generated from the [canjs/canjs#3.x-legacy](https://github.com/canjs/canjs/tree/3.x-legacy) branch. To generate and push a new version of the website, verify you have push access to those branches. Then get all latest changes via:

```
git checkout 3.x-legacy
git fetch --all && git rebase
npm cache clean
rm -rf node_modules
```

We also have to delete the local `gh-pages` branch:

```
git branch -D gh-pages
```

Then run

```
make
```

This will generate and publish a new version of the website.
