# Article List

Fetches an index JSON (e.g. `query-index.json`, built via the
[Index Admin tool](https://tools.aem.live/tools/index-admin/index.html) with
`path`/`title`/`description`/`image` properties) and renders it as a card
grid, in the same visual style as the `cards` block. This is the basis for
the capstone's article listing — extend it with pagination/sorting as
needed.

## Authoring

Simplest form — leave the block empty, it defaults to `/query-index.json`:

| Article List |
| ------------- |

**Custom index source** — put a link to a different index in the block:

| Article List |
| ------------- |
| [Articles Index](/articles-index.json) |

**Scoped to a path prefix** — add a line of plain text after (or instead
of) the link, e.g. to only list entries under `/articles/` from a
site-wide index:

| Article List |
| ------------- |
| /articles/ |

Both a custom source link and a path-prefix filter can be combined in the
same block.

## Rendered markup

```html
<div class="article-list block">
  <ul>
    <li>
      <a class="article-list-card" href="/articles/my-post">
        <div class="article-list-card-image"><picture><img src="..." alt=""></picture></div>
        <div class="article-list-card-body">
          <h3>My Post Title</h3>
          <p>Description text from the index.</p>
        </div>
      </a>
    </li>
    ...
  </ul>
</div>
```

## Behavior

- Fetches the index JSON on decorate; if the request fails or returns no
  matching entries, the block is left empty (decorate defensively — no
  broken list left behind).
- `image` is optional per entry — cards without one just skip the image div.
- `title` falls back to the entry's `path` if missing.

## Notes / TODO

- Verify with `curl localhost:3000/query-index.json` that the index is live
  and shaped as `{ data: [{ path, title, description, image }, ...] }`
  before debugging the block itself.
- No pagination/sorting yet — for the capstone, consider adding a "Load
  more" pattern (see the `employee-list` block for a working example) or
  client-side sorting by date if the index includes one.
