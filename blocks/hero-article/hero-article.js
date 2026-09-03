export default function decorate(block) {
  const rows = [...block.children];

  // First row that contains an image is the cover image cell.
  const imageRow = rows.find((row) => row.querySelector('picture, img'));
  if (imageRow) imageRow.classList.add('hero-article-image');

  // The content row is the one containing the heading (or the last row).
  const contentRow = rows.find((row) => row.querySelector('h1, h2')) || rows[rows.length - 1];
  if (!contentRow) return;
  contentRow.classList.add('hero-article-content');

  const cell = contentRow.querySelector(':scope > div') || contentRow;
  const nodes = [...cell.children];
  const heading = cell.querySelector('h1, h2, h3');
  const paras = nodes.filter((n) => n.tagName === 'P');

  if (paras.length === 0) return;

  // Last paragraph is the category tag; the middle paragraphs are meta.
  const tagPara = paras[paras.length - 1];
  const metaParas = paras.slice(0, -1);

  // Build meta structure: byline (By + author), dateline (date [• readtime]).
  if (metaParas.length) {
    const meta = document.createElement('div');
    meta.className = 'hero-article-meta';

    // Byline: first two paragraphs = "By" + author name.
    const byline = document.createElement('div');
    byline.className = 'hero-article-byline';
    const bylineParas = metaParas.slice(0, 2);
    bylineParas.forEach((p) => byline.append(p));
    if (byline.children.length) meta.append(byline);

    // Dateline: remaining paragraphs (date, bullet, read time).
    const dateParas = metaParas.slice(2);
    if (dateParas.length) {
      const dateline = document.createElement('div');
      dateline.className = 'hero-article-dateline';
      dateParas.forEach((p) => dateline.append(p));
      meta.append(dateline);
    }

    // Insert meta right after the heading (or at the start of the cell).
    if (heading) heading.after(meta);
    else cell.prepend(meta);
  }

  // Category tag pill.
  if (tagPara) {
    const tag = document.createElement('span');
    tag.className = 'hero-article-tag';
    tag.textContent = tagPara.textContent.trim();
    tagPara.replaceWith(tag);
  }
}
