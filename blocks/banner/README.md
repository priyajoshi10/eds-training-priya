# Banner

A banner with an image and a title, laid out side by side. Uses default
block decoration (no custom `banner.js` logic) — authored cells are wrapped
as-is by `scripts/aem.js`.

## Authoring

The block expects exactly 1 row with 2 columns, as authored in Document
Authoring:

| Banner              |                |
| ------------------- | -------------- |
| ![](./banner.jpg)   | # tea          |

| Column | Field | Notes                          |
| ------ | ----- | ------------------------------- |
| 1      | Image | Image shown on the left         |
| 2      | Title | Heading text shown on the right |

## Rendered markup

```html
<div class="banner block">
  <div>
    <div><picture><img src="..." alt=""></picture></div>
    <div><h1>tea</h1></div>
  </div>
</div>
```

## Styling

Styles are scoped to `.banner` in [banner.css](./banner.css):

- Mobile: image and title stack vertically, full width.
- Desktop (`900px`+): image and title sit side by side, each taking half
  the width.

### Dark variant

Name the block `Banner (dark)` in the table header cell to add a dark
background and light text, on top of the base layout (additive, not a
separate block):

```html
<div class="banner dark block">
  ...
</div>
```

Adds `background-color: #1a1a1a` and white text via `.banner.dark` in
[banner.css](./banner.css). Existing banners authored as plain `Banner` are
unaffected.

## Notes / TODO

- Verify actual authored markup via `curl localhost:3000/<page>.plain.html`
  once content is authored, and adjust selectors if the heading level or
  wrapper structure differs.
- Add `banner.js` only if dynamic behavior (e.g. defensive decoration for
  missing image/title) is needed.
