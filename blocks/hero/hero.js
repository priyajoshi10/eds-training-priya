import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

/**
 * Reads the hero's labeled rows (title / sub-title / img / alt) into a
 * config object. Authors may omit any row — decorate defensively.
 * @param {Element} block The hero block element
 * @returns {object} config keyed by normalized row label
 */
function readHeroConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols.length < 2) return;
    const key = toClassName(cols[0].textContent);
    config[key] = cols[1];
  });
  return config;
}

export default function decorate(block) {
  const config = readHeroConfig(block);

  const title = config.title?.textContent.trim();
  const subtitle = config['sub-title']?.textContent.trim();
  const img = config.img?.querySelector('img');
  const alt = config.alt?.textContent.trim() || '';

  const content = document.createElement('div');
  content.className = 'hero-content';

  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title;
    content.append(h1);
  }

  if (subtitle) {
    const p = document.createElement('p');
    p.className = 'hero-subtitle';
    p.textContent = subtitle;
    content.append(p);
  }

  block.textContent = '';

  if (img) {
    const picture = createOptimizedPicture(img.src, alt, false, [{ width: '2000' }]);
    block.append(picture);
  }

  block.append(content);
}
