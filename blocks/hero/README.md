# Hero

A full-bleed hero with a background image, a title, and an optional
subtitle. Unlike banner, hero uses labeled rows (name in column 1, value in
column 2) rather than positional columns, and requires `hero.js` to parse
them into semantic markup.

## Authoring

The block expects labeled rows, as authored in Document Authoring. Any row
can be omitted — decorate defensively, `hero.js` handles missing fields.

| Hero       |                        |
| ---------- | ---------------------- |
| title      | # This is my hero      |
| sub-title  | This is my hero sub-title |
| img        | ![](./hero-image.jpg)  |
| alt        | eds hero                  |

| Row       | Field    | Notes                                                        |
| --------- | -------- | ------------------------------------------------------------- |
| title     | Title    | Heading text. Use **Heading 1** or **Heading 2** style.       |
| sub-title | Subtitle | Plain text, rendered as a paragraph (not a heading).           |
| img       | Image    | Background image, shown full-bleed behind the content.        |
| alt       | Alt text | Applied to the image's `alt` attribute — always set this.     |

## Rendered markup

`hero.js` reads the labeled rows and rebuilds the block into:

```html
<div class="hero block">
  <picture><img src="..." alt="eds hero"></picture>
  <div class="hero-content">
    <h1>This is my hero</h1>
    <p class="hero-subtitle">This is my hero sub-title</p>
  </div>
</div>
```

## Styling

Styles are scoped to `.hero` in [hero.css](./hero.css):

- Image (`picture`) is absolutely positioned to fill the block
  (`object-fit: cover`), title/subtitle sit centered on top via
  `.hero-content`.
- `.hero h1` and `.hero h2` are both styled identically, colored via
  `var(--background-color)` for contrast against the image.
- Padding increases at the `900px` breakpoint.

## Notes / TODO

- Verify actual authored markup via `curl localhost:3000/<page>.plain.html`
  once content is authored, and adjust row-label matching in `hero.js` if
  authors use different label wording.
- `sub-title` is intentionally rendered as a `<p>`, not an `<h2>`/`<h3>`, to
  avoid competing with the page's heading hierarchy.
