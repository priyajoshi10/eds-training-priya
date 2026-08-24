import { getMetadata } from '../../scripts/aem.js';

/**
 * Turns a URL path segment into a readable label, e.g. "red-shoes" -> "Red Shoes".
 * @param {string} segment
 * @returns {string}
 */
function toLabel(segment) {
  return segment
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Builds a breadcrumb trail from the current page's URL path.
 * @param {HTMLElement} block The breadcrumb block element
 */
export default function decorate(block) {
  const title = getMetadata('og:title');
  const { pathname } = window.location;
  const segments = pathname.split('/').filter(Boolean);

  const trail = [{ text: 'Home', link: '/' }];
  let path = '';
  segments.forEach((segment) => {
    path += `/${segment}`;
    trail.push({ text: toLabel(segment), link: path });
  });

  // the current page is never a link; prefer its title over the raw slug
  const current = trail.at(-1);
  current.text = title || current.text;
  delete current.link;

  const ul = document.createElement('ul');
  trail.forEach((step) => {
    const li = document.createElement('li');
    let wrap = li;
    if (step.link) {
      wrap = document.createElement('a');
      wrap.href = step.link;
      li.append(wrap);
    }
    const span = document.createElement('span');
    span.textContent = step.text;
    wrap.append(span);
    ul.append(li);
  });

  block.append(ul);
}
