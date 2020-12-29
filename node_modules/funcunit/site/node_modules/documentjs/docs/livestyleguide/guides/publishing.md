@page publishing Publishing Your Style Guide
@parent lsg.guides 99

Once you've created the Live Style Guide, you may want to be able to publish it to share it with stakeholders.

## The Generated Site

However you decide to publish your Live Style Guide, everything you need has been generated in the output directory defined in your `document.json` configuration file. In our guides, this directory is `styleguide`. Simply publish this entire folder and you'll have a self-contained site.

## Live Hosting

Your Live Style Guide will automatically change and evolve along with your project. However, if you'd like your published guide to change as well, you'll need to do some additional setup based on how you're hosting the site.

### GitHub Pages

If your project is using [GitHub Pages](https://pages.github.com/), the publised version will automatically update whenever you push changes to the gh-pages branch. It is important to note that you ***must run the documentjs command to build the site locally, then push the generated files to GitHub***.

### Advanced Setup

For other situations, you may need a developer's help with hosting the Live Style Guide. If you need help with a specific project, you can also ask in [Gitter](gitter.im/bitovi/documentjs).