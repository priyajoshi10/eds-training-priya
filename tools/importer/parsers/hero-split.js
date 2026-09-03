/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-split.
 * Base block: hero (1 column, 3 rows: name / image / content).
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Source structure: <header> with a 2-column grid — first column holds the
 * text (h1, subheading, two CTAs), second column holds three stacked images.
 * Hero convention: row 2 = image(s), row 3 = title/subheading/CTA. The
 * hero-split block adds `no-image` when the first row has no picture, so the
 * images go into the first content row.
 */
export default function parse(element, { document }) {
  // Heading: main h1 (fall back to other heading levels / title class)
  const heading = element.querySelector('h1, h2, .h1-heading, [class*="heading"]');
  // Subheading / lead paragraph
  const subheading = element.querySelector('.subheading, p');
  // CTAs (mutually exclusive: only anchors inside a button group / buttons)
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));
  // Images shown alongside the text (the visual half of the split hero)
  const images = Array.from(element.querySelectorAll('img'));

  // Empty-block guard: bail gracefully if there is no meaningful content
  if (!heading && !subheading && images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: image(s) — single cell holding all the split-hero images
  if (images.length) {
    cells.push([images]);
  }

  // Row: content — single cell holding heading, subheading and CTAs
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-split', cells });
  element.replaceWith(block);
}
