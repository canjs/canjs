@page lsg-quickstart-creating-page Creating a Page
@parent lsg-quickstart-group-your-first-page 0

## Tags

When you're writing with DocumentJS, you'll use [tags](/docs/tag-definition.html). These are `@`-prefixed and tell DocumentJS to do something specific.

*Note: Every time this guide introduces a new tag, you'll see a section like the following.*

## New Tag: `@@page`

The `@@page` tag creates a standalone page.

### Example

With our configuration, this will generate a page called `my-styleguide.html`

```markdown
@@page my-styleguide My Style Guide
```

### Arguments

```markdown
@@page NAME TITLE
```

The first argument, `NAME`, is the unique identifier for your page. It is how you will reference other pages later and how DocumentJS names the generated `html` files. The second argument, `TITLE`, is the title that will be displayed on the page.

## Creating Your First Page

Create a file in the `styles` directory called `styleguide.md` that looks like this:
```markdown
@@page my-styleguide My Style Guide

Welcome to my Style Guide!
```

Anything after the line with the tag will be used as text on your page.

Next, we'll [generate the site for the first time](./lsg-quickstart-generate.html).