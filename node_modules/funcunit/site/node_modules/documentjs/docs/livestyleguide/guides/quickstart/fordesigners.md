@page lsg-quickstart-designers DocumentJS for Designers
@parent lsg-quickstart-group-intro 0

Though you're documenting your styles, the tool you'll be using is DocumentJS. As long as your project is using [npm](http://npmjs.org), you will be able to:

* Generate a living site that automatically updates as your project's design evolves
* Write a style guide with inline comments in stylesheets or with individual markdown files
* Include demos to display examples alongside sample markup
* Organize pages into navigation groups like "Elements," "Themes," and "Components"

To see an example of this, check out this site's example [Live Style Guide](/examples/styles/index.html).


### What DocumentJS Does
<sup>*[Skip this section](/docs/lsg-quickstart-installation.html) if you're comfortable with magic and don't care how DocumentJS works.*</sup>

DocumentJS is a [*static site generator*](https://staticsitegenerators.net/). This means it scans specially formatted input files and creates a website that remains unchanged until the generator runs again. Whereas in a content management system changes happen somewhat automatically, a static site generator usually needs to be **run manually** and then the generated files must be **uploaded**.

While this may seem more complicated than a CMS, static site generation works especially well for a Live Style Guide. Since your stylesheets are also the source files for your style guide, **changes to your stylesheets are also changes to your Live Style Guide**.

To build your Live Style Guide, DocumentJS does the following:

1. Reads through files specified in its configuration
2. Looks in your commments for tags like `@page`, `@group`, and `@parent` to determine site layout
3. Looks in your comments for tags like `@stylesheet`, `@styles`, and `@demo` to create the individual parts of your style guide
4. Automatically generates `html` files




[Next Page](/docs/lsg-quickstart-installation.html)
