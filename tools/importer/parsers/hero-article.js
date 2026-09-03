/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-article.
 * Base block: hero (1 column, 3 rows: name / background image / content).
 * Source: https://wknd-trendsetters.site/blog/ace-pro-court-polo (blog-article template)
 * Generated: 2026-09-03
 *
 * Source structure: a section > container > grid-layout with two cells:
 *   - cell 1: the article cover image (img.cover-image)
 *   - cell 2: breadcrumbs (.breadcrumbs), the article H1 title (h1.h2-heading),
 *     a byline group ("By" + author name), a meta group (publish date • read time),
 *     and a category tag (.tag). No CTA buttons.
 *
 * Hero convention: row 2 = background/cover image, row 3 = all textual header
 * content (title + supporting metadata) placed in a single cell.
 */
export default function parse(element, { document }) {
  // Row 2: cover image (fallbacks for class variations / plain img)
  const coverImage = element.querySelector('img.cover-image, img[class*="cover"], img');

  // Row 3 content pieces
  const breadcrumbs = element.querySelector('.breadcrumbs');
  const heading = element.querySelector('h1, .h2-heading, [class*="heading"]');
  // Byline + date/read-time metadata groups (horizontal flex rows)
  const metaGroups = Array.from(
    element.querySelectorAll(':scope div > .flex-horizontal, .flex-horizontal'),
  );
  const tag = element.querySelector('.tag, [class*="tag"]');

  // Empty-block guard
  if (!heading && !coverImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: cover image
  if (coverImage) cells.push([coverImage]);

  // Row: content — single cell holding breadcrumbs, title, byline/meta, tag
  const contentCell = [];
  if (breadcrumbs) contentCell.push(breadcrumbs);
  if (heading) contentCell.push(heading);
  metaGroups.forEach((group) => contentCell.push(group));
  if (tag) contentCell.push(tag);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
