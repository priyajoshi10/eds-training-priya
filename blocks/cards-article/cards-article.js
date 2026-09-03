import { createOptimizedPicture } from '../../scripts/aem.js';

const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
const DATE_RE = new RegExp(`^(.*?)\\s+((?:${MONTHS})[a-z]*\\.?\\s+\\d{1,2}.*)$`);

export default function decorate(block) {
  // Pull the preceding default content (intro heading + lead paragraph) into the
  // block so the whole light band (intro + grid) lives inside one wrapper.
  const wrapper = block.closest('.cards-article-wrapper') || block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  let intro = null;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    intro = document.createElement('div');
    intro.className = 'cards-article-intro';
    while (prev.firstElementChild) intro.append(prev.firstElementChild);
    prev.remove();
  }

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-article-card-image';
      else div.className = 'cards-article-card-body';
    });

    const body = li.querySelector('.cards-article-card-body');
    if (body) {
      const paras = [...body.querySelectorAll('p')];
      const linkP = paras.find((p) => p.querySelector('a'));
      const anchor = linkP ? linkP.querySelector('a') : null;
      const metaP = paras.find((p) => !p.querySelector('a'));

      if (metaP) {
        const text = metaP.textContent.trim();
        const meta = document.createElement('div');
        meta.className = 'cards-article-card-meta';
        const m = text.match(DATE_RE);
        const [, category, dateText] = m || [];
        const tag = document.createElement('span');
        tag.className = 'cards-article-tag';
        tag.textContent = m ? category : text;
        meta.append(tag);
        if (m) {
          const date = document.createElement('span');
          date.className = 'cards-article-date';
          date.textContent = dateText;
          meta.append(date);
        }
        metaP.replaceWith(meta);
      }

      if (linkP) linkP.remove();

      if (anchor && anchor.getAttribute('href')) {
        const cardLink = document.createElement('a');
        cardLink.className = 'cards-article-card-link';
        cardLink.href = anchor.getAttribute('href');
        while (li.firstElementChild) cardLink.append(li.firstElementChild);
        li.append(cardLink);
      }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  if (intro) block.append(intro);
  block.append(ul);
}
