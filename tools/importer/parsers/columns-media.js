/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media.
 * Base block: columns (multi-column, one row per visual grouping).
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Source structure: a 2-column grid — left column holds a cover image,
 * right column holds breadcrumbs, an h2 heading and byline metadata.
 * Columns convention: each direct child of the grid becomes one column
 * in a single content row.
 */
export default function parse(element, { document }) {
  // The grid whose direct children are the columns
  const grid = element.querySelector('.grid-layout') || element.querySelector('.container') || element;
  const columns = Array.from(grid.children);

  // Empty-block guard
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Preserve a leading centered intro (heading + lead paragraph) that sits
  // before the grid as default content ahead of the block, so it isn't lost.
  // On pages with no such intro (e.g. the homepage) this is a no-op.
  const intro = element.querySelector('.utility-text-align-center');
  const before = [];
  if (intro && !grid.contains(intro) && intro !== grid) {
    before.push(intro.cloneNode(true));
  }

  const cells = [];
  // Single content row: one cell per source column (preserve full inner content)
  cells.push(columns.map((col) => col));

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(...before, block);
}
