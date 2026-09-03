/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-gallery.
 * Base block: cards (image-only gallery variant).
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Source structure: a centered heading + lead paragraph (default content),
 * followed by a responsive grid of image-only cards (each grid child is a
 * div wrapping a single cover image, no captions).
 *
 * The cards-gallery block decorates each row into a card; a card whose only
 * content is a picture becomes a `cards-gallery-card-image`. So each image
 * card is a single-cell row. The leading heading/paragraph is default content
 * and is preserved BEFORE the block so no content is lost.
 */
export default function parse(element, { document }) {
  // Leading default content (centered heading + lead paragraph) preceding the grid
  const intro = element.querySelector('.utility-text-align-center, .container > div:first-child');

  // The gallery grid holding the image cards
  const grid = element.querySelector('.grid-layout');
  const cardDivs = grid ? Array.from(grid.children) : [];

  // Empty-block guard
  if (cardDivs.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // One row per card; single cell containing the card's image
  cardDivs.forEach((div) => {
    const img = div.querySelector('img, picture');
    cells.push([img || div]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gallery', cells });

  // Preserve leading default content (heading/paragraph) ahead of the block
  const before = [];
  if (intro && !grid.contains(intro) && intro !== grid) before.push(intro);
  element.replaceWith(...before, block);
}
