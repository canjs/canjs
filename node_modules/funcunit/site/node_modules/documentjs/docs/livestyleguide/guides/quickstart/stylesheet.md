@page lsg-quickstart-stylesheet Documenting a Stylesheet
@parent lsg-quickstart-group-writing 0

*The next few pages will be very information-dense. If you're the kind of person who takes breaks, now would be a good time a good time.*

To document a stylesheet, we're going to need to use two more tags:

- `@stylesheet` to create a page for each stylesheet documented
- `@styles` to document individual styles

When all of these are put together, a documented stylesheet file (`css`, `less`, or `scss`) will look something like this:

```css
/**
 *  @@stylesheet typeography.less Typography
 *  
 *  Global style definitions for all typographic elements 
 *  including headings, paragraphs, lists, and blockquotes.
 */

/**
 * @@styles headings Headings
 *
 * H tags defining a typographical heirarchy
 */
h1,h2,h3,h4,h5,h6{
    margin: 0;
    margin-bottom: 10px;
}

```

As a result our styleguide will start to look like [this page](/examples/styles/typography.less.html). Don't worry about the live demos just yet--we'll get to that soon.

## New Tag: `@@stylesheet`

The `@@stylesheet` tag creates an individual page to document a stylesheet. Instead of creating a separate file, you'll use this tag.

### Example

In a file like `typography.less`:

```css
/**
 *  @@stylesheet typeography.less Typography
 *  
 *  Global style definitions for all typographic elements 
 *  including headings, paragraphs, lists, and blockquotes.
 */
```

This will create a page in the `stylesheet` directory called `typography.less.html`. Like with the `@@page` tag, anything you write below the tag will be used as a description in the page.

### Arguments

The @@stylesheet tag behaves similarly to the @@page tag, so it has the same arguments.

```markdown
@@stylesheet NAME TITLE
```

`NAME` is the unique name of the page for reference purposes (and will determine the name of the `html` file). It is often going to make sense to just make `NAME` the name of the file (on the [example Live Style Guide](/examples/styles/typography.less.html) you will see file names listed under the titles for this reason).

`TITLE` is the title that will be displayed on the page.

## New Tag: `@@styles`

The `@@styles` tag allows you to define an individual set of styles. 

>**Whenever you use this tag in a stylesheet that already used the @@stylesheet tag, your `@@styles` documentation will be included in that stylesheet. When using this tag, the comments you may already have been writing will automatically become a part of your live style guide.**

### Example

In a file like `typography.less` (that already has a `@@stylesheet` tag at the start of the file):

```css
/**
 * @styles headings Headings
 * 
 * H tags defining a typographical heirarchy
 */
h1,h2,h3,h4,h5,h6{
    margin: 0;
    margin-bottom: 10px;
}
```

*Note: the actual styles declared below the comments will not be included in the styleguide. They are only shown for context.*

### Arguments

```markdown
@@styles NAME TITLE
```

`NAME` is the unique name of the page for reference purposes (but is less important in this case). `TITLE` is the title of the heading that will be displayed on the generated stylesheet page.

[Next Page](/docs/lsg-quickstart-organizing.html)