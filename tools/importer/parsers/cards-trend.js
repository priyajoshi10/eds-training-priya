/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-trend.
 * Base block: cards (2 columns: image | text body, one row per card).
 * Source: https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport (card-gallery template)
 * Generated: 2026-09-03
 *
 * Source structure: a centered heading + lead paragraph (default content),
 * followed by a grid of trend cards. Each card is an <a class="trend-card
 * card-link"> wrapping an image div (.trend-card-image > img.cover-image) and a
 * body div (.trend-card-body) containing a category tag (span.tag), an h3
 * heading and a description paragraph.
 *
 * Cards convention: cell 1 = image, cell 2 = text content (tag/title/desc/CTA).
 * The ENTIRE .trend-card-body is placed in the text cell so the tag, heading
 * AND description are all preserved (not dropped). Each card links to a trend
 * detail page, so the card's href is appended to the body cell as a CTA to
 * preserve the destination link. The leading intro (centered "Trend alert"
 * heading + "Fresh fits, bold moves" paragraph) is default content and is
 * preserved BEFORE the block so no content is lost.
 */
export default function parse(element, { document }) {
  // Leading default content (centered heading + lead paragraph)
  const intro = element.querySelector('.utility-text-align-center, .container > div:first-child');

  const grid = element.querySelector('.grid-layout');
  // Select every trend-card anchor anywhere under the section. Using a flat
  // querySelectorAll on the section (not the grid's direct children) is the most
  // robust across DOM engines — some importer DOMs mis-handle child traversal on
  // the grid container, collapsing the card list to a single item.
  let cards = Array.from(element.querySelectorAll('a.trend-card, a.card-link'));
  if (cards.length === 0 && grid) {
    cards = Array.from(grid.children).filter((c) => c.tagName === 'A');
  }

  // Empty-block guard
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cards.forEach((card) => {
    // Image cell: clone the image so no live node is moved/aliased across rows
    // (moving a live node can detach siblings in some importer DOM engines).
    const imageSrc = card.querySelector('.trend-card-image, img, picture');
    const imageCell = imageSrc ? imageSrc.cloneNode(true) : '';

    // Text cell: clone the whole body (preserves tag + heading + description).
    const body = card.querySelector('.trend-card-body');
    const bodyCell = [];
    if (body) {
      bodyCell.push(body.cloneNode(true));
    } else {
      const tag = card.querySelector('.tag, span[class*="tag"]');
      const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
      const desc = card.querySelector('p');
      if (tag) bodyCell.push(tag.cloneNode(true));
      if (heading) bodyCell.push(heading.cloneNode(true));
      if (desc) bodyCell.push(desc.cloneNode(true));
    }

    // Preserve the card's destination link as a CTA at the bottom of the cell.
    // Strip any `#card<N>` uniqueness marker added by the preprocess hook (see
    // import-card-gallery.js) — that marker only exists to stop the importer's
    // preprocessing from merging consecutive same-href anchors into one.
    let href = card.getAttribute('href');
    if (href) {
      href = href.replace(/#card\d+$/, '');
      const heading = (body || card).querySelector('h1, h2, h3, h4, h5, h6');
      const cta = document.createElement('a');
      cta.href = href;
      cta.textContent = heading ? heading.textContent.trim() : 'Read more';
      bodyCell.push(cta);
    }

    cells.push([imageCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-trend', cells });

  // Preserve leading default content ahead of the block
  const before = [];
  if (intro && grid && !grid.contains(intro) && intro !== grid) before.push(intro);
  element.replaceWith(...before, block);
}
