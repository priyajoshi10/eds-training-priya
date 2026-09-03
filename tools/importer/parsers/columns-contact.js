/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact.
 * Base block: columns.
 * Source: https://wknd-trendsetters.site/faq
 * Generated: 2026-09-03
 *
 * Layout: text-only two-column "Let's connect" section.
 *  - Left column: H2 heading + invite paragraph.
 *  - Right column: stacked Email / Phone / Address contact list (no images).
 * Produces a single content row with two cells (2-column columns block).
 */
export default function parse(element, { document }) {
  // The columns live as direct children of the grid layout wrapper.
  const grid = element.querySelector('.grid-layout, .container > div');
  const columnEls = grid
    ? Array.from(grid.querySelectorAll(':scope > div'))
    : Array.from(element.querySelectorAll(':scope .container > div > div'));

  // Left column: heading + intro paragraph.
  const heading = element.querySelector('h1, h2, h3, [class*="heading"]');
  const intro = element.querySelector('h2 + p, [class*="heading"] + p, .container p');

  // Right column: contact list (Email/Phone/Address entries).
  const contactList = element.querySelector('.contact-items');

  const leftCell = [];
  const rightCell = [];

  // Prefer the natural DOM grouping (two sibling column divs) when present.
  if (columnEls.length >= 2) {
    leftCell.push(...columnEls[0].childNodes);
    rightCell.push(...columnEls[1].childNodes);
  } else {
    if (heading) leftCell.push(heading);
    if (intro) leftCell.push(intro);
    if (contactList) rightCell.push(contactList);
  }

  // Empty-block guard: bail gracefully if nothing meaningful was extracted.
  if (leftCell.length === 0 && rightCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([leftCell, rightCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
