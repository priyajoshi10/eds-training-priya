/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroSplitParser from './parsers/hero-split.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsGalleryParser from './parsers/cards-gallery.js';
import tabsProfileParser from './parsers/tabs-profile.js';
import cardsArticleParser from './parsers/cards-article.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import heroOverlayParser from './parsers/hero-overlay.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-split': heroSplitParser,
  'columns-media': columnsMediaParser,
  'cards-gallery': cardsGalleryParser,
  'tabs-profile': tabsProfileParser,
  'cards-article': cardsArticleParser,
  'accordion-faq': accordionFaqParser,
  'hero-overlay': heroOverlayParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Marketing landing layout: full-width hero followed by stacked content and CTA sections',
  urls: [
    'https://wknd-trendsetters.site/',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
  ],
  blocks: [
    { name: 'section-hero-split', instances: ['#main-content > header.section.secondary-section'], section: 'light' },
    { name: 'hero-split', instances: ['#main-content > header.section.secondary-section'] },
    { name: 'columns-media', instances: ['#main-content > section.section:nth-of-type(1)'] },
    { name: 'section-gallery', instances: ['#main-content > section.section.secondary-section:nth-of-type(2)'], section: 'light' },
    { name: 'cards-gallery', instances: ['#main-content > section.section.secondary-section:nth-of-type(2)'] },
    { name: 'tabs-profile', instances: ['#main-content > section.section:nth-of-type(3)'] },
    { name: 'section-articles', instances: ['#main-content > section.section.secondary-section:nth-of-type(4)'], section: 'light' },
    { name: 'cards-article', instances: ['#main-content > section.section.secondary-section:nth-of-type(4)'] },
    { name: 'accordion-faq', instances: ['#main-content > section.section:nth-of-type(5)'] },
    { name: 'hero-overlay', instances: ['#main-content > section.section.inverse-section'] },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all parseable blocks on the page based on the embedded template.
 * Entries whose name starts with "section-" are section-style markers,
 * not parseable blocks, so they are skipped here.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks
    .filter((blockDef) => !blockDef.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      });
    });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by an earlier parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path; map homepage ("/") to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
