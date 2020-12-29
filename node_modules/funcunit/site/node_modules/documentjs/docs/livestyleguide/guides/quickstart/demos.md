@page lsg-quickstart-demos Live Demos
@parent lsg-quickstart-group-writing 2

The last thing you'll need in your Live Style Guide is the Live Demos. There are two more tags you'll use for this:

- `@@demo` to show a live demo as well as sample HTML for that demo
- `@@iframe` to show a live demo on its own

## Creating Demos

Before you link to your demos, you'll need to create an individual page for each of them. In your `demos` directory, create an HTML file for any demo you want to show and link to your project's relevant stylesheet(s). **Since your demos and your overall project use the same source styles, your live demos will change whenever your design changes**.

These demo pages are not generated or changed by DocumentJS, so you need to put them together manually as you would any web page and you need to be able to link to them from your project. As long as you followed the instructions for [file organization](/docs/lsg-quickstart-file-organization.html) and [site generation](/docs/lsg-quickstart-generate.html) so far, you should be able to follow along with the examples below if you put your demo files in the `demos` directory. Otherwise, you may need to figure some things out on your own.

## New Tag: `@@demo`

The `@@demo` tag displays a live demo and the markup for that demo.

### Example

In the following example, the demo page must be located at `demos/forms.html`.

In `base.less`:
```css
/**
 * @@stylesheet base-styles Base Styles
 * @@parent styleguide-baseline 0
 */

/**
 * @@styles forms Forms 
 * 
 * @@demo demos/forms.html
 */
```

On the "Base Styles" stylesheet page generated from `base.less`, there will now be a demo showing whatever page is at `demos/forms.html`. In the [Example Style Guide](/examples/styles/base.less.html), that looks like this:

@demo examples/demos/forms.html


### Arguments

```markdown
@@demo FILEPATH
```

The `FILEPATH` argument is a link to the location of the demo page.

## New Tag: `@@iframe`

Sometimes you'll want a live demo without displaying any markup. To do this, just use the `@@iframe` tag instead.

### Example

In the following example, the live demo must be located located at `demos/headings.html`.

In `typography.less`:
```css
/**
 * @@stylesheet typography.less Typography
 * @@parent styleguide-baseline 1
 */

/**
 * @@styles headings Headings
 *
 * @@demo demos/headings.html
 */
```

Similar to above, but without the "HTML" tab, there will be a demo. In the [Example Style Guide](/examples/styles/typography.less.html), that looks like this:

@iframe examples/demos/headings.html


### Arguments

```markdown
@@iframe FILEPATH
```

Just like with the `@@demo` tag, the `FILEPATH` argument is a link to the location of the demo page.

[Next Page](/docs/lsg-custom-styles.html)