/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import columnsContactParser from './parsers/columns-contact.js';
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';

const parsers = {
  'hero-split': heroSplitParser,
  'accordion-faq': accordionFaqParser,
  'columns-contact': columnsContactParser,
};
const transformers = [cleanupTransformer];

const PAGE_TEMPLATE = {
  name: 'faq-page',
  description: 'Support layout: hero header, accordion of expandable items, contact columns, CTA',
  urls: ['https://wknd-trendsetters.site/faq'],
  blocks: [
    { name: 'section-hero', instances: ['#main-content > header.section.secondary-section'], section: 'light' },
    { name: 'hero-split', instances: ['#main-content > header.section.secondary-section'] },
    { name: 'accordion-faq', instances: ['#main-content > section.section:nth-of-type(1)'] },
    { name: 'section-contact', instances: ['#main-content > section.section.secondary-section'], section: 'light' },
    { name: 'columns-contact', instances: ['#main-content > section.section.secondary-section'] },
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
