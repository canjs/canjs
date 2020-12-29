@page lsg-quickstart-organizing Organizing your Style Guide
@parent lsg-quickstart-group-writing 1

After you've documented your first stylesheet, if you [generate the site](/docs/lsg-quickstart-generate.html) you won't see your stylesheet page anywhere in the sidebar. Even though the page has been generated, it isn't linked up to the rest of the site because you need to tell DocumentJS where to put it.

We have two more tags so you can organize your style guide:

- `@@parent` to tell DocumentJS where to put links to your pages and stylesheets
- `@@group` to organize links in the sidebar


## New Tag: `@@parent`

The `@@parent` tag organizes your site by telling DocumentJS where to put a link to your page or stylesheet.

### Example

The following tells DocumentJS that the parent page of `Typography` is our main page, `styleguide`. After using this tag, the `Typography` page will show up in the sidebar in the first position.

```less
/**
 * @@stylesheet typography.less Typography
 * @@parent styleguide 0
 */
```

### Arguments

```markdown
@@parent NAME ORDER
```

The `NAME` argument is the unique name *of the parent*. The `ORDER` argument allows you to specify the order in which this child shows up in the sidebar. By default, children will be ordered alphabetically.

## New Tag: `@@group`

The `@@group` tag organizes pages with headings in the sidebar. On the left of this page, the groups are "INTRO," "SETUP", "YOUR FIRST PAGE", "WRITING", and "CUSTOMIZING".

### Example

The group tag is used on a parent page. In this case, you will want to specify groups in `stylesheet.md`:

```markdown
@@page my-styleguide My Style Guide
@@group styleguide-theme 0 Theme
@@group styleguide-baseline 1 Baseline Elements
@@group styleguide-docs 2 API
@@group styleguide-other 3 Other
```

### Arguments

```markdown
@@group NAME ORDER TITLE 
```

The `NAME` argument is the unique name. You'll use this as an argument for `@@parent` in pages or stylesheets that belong in this group.

The `ORDER` specifies the order in which groups should appear in the sidebar. By default, they will be organized alphabetically.

The `TITLE` is displayed as a heading in the sidebar.

## Putting Stylesheets into Groups

Once you've specified groups in `stylesheet.md`, you just need to make those groups the `@@parent` of your stylesheets (instead of using the base page). If you want to make put your Typography stylesheet in the "Baseline Elements" group, put this in `typography.less`

```
/**
 * @@stylesheet typography.less Typography
 * @@parent styleguide-baseline 0
 * 
 * Global style definitions for all typographic elements including headings, paragraphs, lists, and blockquotes.
 **/
```

Notice that we are using the name we declared as a `@@group` as the parent.

[Next Page](/docs/lsg-quickstart-demos.html)