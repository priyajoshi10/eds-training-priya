/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq.
 * Base block: accordion (2 columns: title | content, one row per item).
 * Source: https://wknd-trendsetters.site/ (landing-page template)
 * Generated: 2026-09-03
 *
 * Source structure: an intro heading + subheading (default content) followed
 * by a .faq-list of <details class="faq-item"> items. Each item has a
 * <summary class="faq-question"> (the question text, with a decorative + icon)
 * and a <div class="faq-answer"> (the answer body).
 *
 * Accordion convention: cell 1 = clickable title, cell 2 = content body.
 * The decorative toggle icon is dropped (re-added by the block's CSS/JS).
 * The intro heading/subheading is default content preserved BEFORE the block.
 */
export default function parse(element, { document }) {
  // Leading default content (heading + subheading) preceding the FAQ list
  const intro = element.querySelector('.grid-layout > div:first-child, .container > div:first-child');

  const items = Array.from(element.querySelectorAll('details.faq-item, .faq-list > details, details'));

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    const summary = item.querySelector('summary, .faq-question');
    const answer = item.querySelector('.faq-answer');

    // Title cell: prefer the question text span, else the summary text
    const questionText = summary
      ? (summary.querySelector('span') || summary)
      : null;
    const titleCell = document.createElement('div');
    if (questionText) titleCell.append(...questionText.childNodes);

    cells.push([titleCell, answer || '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });

  // Preserve leading default content ahead of the block
  const list = element.querySelector('.faq-list');
  const before = [];
  if (intro && list && !list.contains(intro) && intro !== list) before.push(intro);
  element.replaceWith(...before, block);
}
