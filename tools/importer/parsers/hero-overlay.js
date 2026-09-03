/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay.
 * Base block: hero (1 column, 3 rows: name / background image / content).
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Source structure: an inverse-section banner with a full-bleed cover image,
 * a dark overlay layer, and a .card-body holding an h2 heading, a subheading
 * paragraph and a single CTA button.
 *
 * Hero convention: row 2 = background image, row 3 = title/subheading/CTA.
 * The decorative empty .overlay div carries no content and is dropped.
 */
export default function parse(element, { document }) {
  // Background image (the full-bleed cover image behind the overlay)
  const bgImage = element.querySelector('img.utility-overlay, img[class*="overlay"], img');
  // Text content lives in the card body over the overlay
  const heading = element.querySelector('.card-body h1, .card-body h2, h1, h2, .h1-heading');
  const subheading = element.querySelector('.card-body p, .subheading, p');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: background image
  if (bgImage) cells.push([bgImage]);

  // Row: content — single cell holding heading, subheading and CTA(s)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay', cells });
  element.replaceWith(block);
}
