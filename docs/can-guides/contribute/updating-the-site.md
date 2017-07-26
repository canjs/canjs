@page guides/contributing/updating-the-site Updating the Site
@parent guides/contribute 10
@outline 2
@description How to update the CanJS website.

@body

canjs.com is hosted on [GitHub pages](https://pages.github.com/) from the [canjs/canjs#gh-pages](https://github.com/canjs/canjs/tree/gh-pages) branch. To generate and push a new version of the website, verify you have push access to that branch. Then get all latest changes via:

```
git checkout master
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
