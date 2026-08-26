# Employee List

Renders employees from a published sheet, 10 rows at a time, with a "Load
more" button that appends the next 10. The button's label comes from the
site's placeholders sheet, not hardcoded text.

## Authoring

### 1. Employee data sheet
Create a **Sheet** (not a Doc) — e.g. at `/employees` — with these exact
column headers:

| Name | Department | Experience | City |
| ---- | ---------- | ---------- | ---- |
| Jane Doe | Engineering | 5 years | Austin |
| ... | ... | ... | ... |

Preview/publish it. It becomes fetchable at `/employees.json`.

### 2. Placeholders sheet
At the site root, a Sheet named `/placeholders` with `Key` / `Text`
columns:

| Key | Text |
| --- | ---- |
| loadMore | Load more |

Preview/publish it → `/placeholders.json`. If missing or the `loadMore` key
isn't set, the button falls back to "Load more".

### 3. The block itself
Insert a table named `Employee List` on the page:

| Employee List |
| -------------- |

Leave it empty to use the default source (`/employees.json`), or put a link
in it pointing to a different sheet path:

| Employee List |
| -------------- |
| [Employees](/other-path/employees) |

## Behavior

- Fetches the employees JSON and the placeholders JSON in parallel.
- Renders a `<table>` with `Name/Department/Experience/City` headers.
- Shows 10 rows initially; each "Load more" click appends the next 10.
- The button removes itself once all rows have been rendered.
- If the data source 404s, the button is removed and the table stays empty
  (decorate defensively — no broken button left behind).

## Notes / TODO

- Verify with `curl localhost:3000/employees.json` and
  `curl localhost:3000/placeholders.json` that both sheets are live before
  debugging the block itself.
- Page size (10) is a constant (`PAGE_SIZE`) in `employee-list.js` — change
  there if a different batch size is needed.
