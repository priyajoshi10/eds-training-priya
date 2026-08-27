import { createOptimizedPicture } from '../../scripts/aem.js';

const DEFAULT_SOURCE = '/query-index.json';

/**
 * Builds one card for an index entry.
 * @param {{path: string, title?: string, description?: string, image?: string}} item
 * @returns {HTMLLIElement}
 */
function renderCard(item) {
  const li = document.createElement('li');

  const link = document.createElement('a');
  link.className = 'article-list-card';
  link.href = item.path;

  if (item.image) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'article-list-card-image';
    imageWrapper.append(createOptimizedPicture(item.image, item.title || '', false, [{ width: '400' }]));
    link.append(imageWrapper);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  const title = document.createElement('h3');
  title.textContent = item.title || item.path;
  body.append(title);

  if (item.description) {
    const description = document.createElement('p');
    description.textContent = item.description;
    body.append(description);
  }

  link.append(body);
  li.append(link);
  return li;
}

/**
 * Fetches an index JSON (e.g. query-index.json) and renders its entries as
 * a card list. Optionally scoped to a path prefix.
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const source = link ? link.getAttribute('href') : DEFAULT_SOURCE;
  // any plain text left over (not part of the link) is an optional path
  // prefix filter, e.g. "/articles/" to only list entries under that path
  const filter = block.textContent.replace(link?.textContent || '', '').trim();
  block.textContent = '';

  const resp = await fetch(source.endsWith('.json') ? source : `${source}.json`);
  if (!resp.ok) return;

  const { data = [] } = await resp.json();
  const items = filter ? data.filter((item) => item.path?.startsWith(filter)) : data;
  if (!items.length) return;

  const ul = document.createElement('ul');
  items.forEach((item) => ul.append(renderCard(item)));
  block.append(ul);
}
