/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import cardsTrendParser from './parsers/cards-trend.js';
import columnsMediaParser from './parsers/columns-media.js';
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';

const parsers = {
  'hero-split': heroSplitParser,
  'cards-trend': cardsTrendParser,
  'columns-media': columnsMediaParser,
};
const transformers = [cleanupTransformer];

const PAGE_TEMPLATE = {
  name: 'card-gallery',
  description: 'Gallery layout: hero header followed by a large repeating grid of content cards',
  urls: ['https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport'],
  blocks: [
    { name: 'hero-split', instances: ['#main-content > header.section.secondary-section'] },
    { name: 'cards-trend', instances: ['#trends'] },
    { name: 'columns-media', instances: ['#main-content > section.section.secondary-section'] },
    { name: 'section-cta', instances: ['#main-content > section.section.accent-section'], section: 'accent' },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks
    .filter((b) => !b.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        elements.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null }));
      });
    });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  // Runs on the raw DOM BEFORE the importer's own preprocessing. The importer
  // merges consecutive anchors that share an identical href into a single link,
  // which would collapse the 8 same-href trend cards (all → /fashion-trends-young-adults)
  // down to one before any parser runs. Appending a unique `#card<N>` marker here
  // keeps the anchors distinct so all 8 survive; the cards-trend parser strips the
  // marker when it rebuilds each card's CTA, so the final output links are clean.
  preprocess: ({ document }) => {
    document.querySelectorAll('#trends a.trend-card, .grid-layout > a.card-link').forEach((a, i) => {
      const href = a.getAttribute('href');
      if (href && !/#card\d+$/.test(href)) {
        a.setAttribute('href', `${href}#card${i}`);
      }
    });
  },
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
      } else { console.warn(`No parser found for block: ${block.name}`); }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
