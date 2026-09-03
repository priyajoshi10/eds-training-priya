import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Pull the preceding default content (intro heading + lead paragraph) into the
  // block so intro + grid read as one centered section (matches source #trends).
  const wrapper = block.closest('.cards-trend-wrapper') || block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  let intro = null;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    intro = document.createElement('div');
    intro.className = 'cards-trend-intro';
    while (prev.firstElementChild) intro.append(prev.firstElementChild);
    prev.remove();
  }

  // Build the card grid as ul > li.
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-trend-card-image';
      else div.className = 'cards-trend-card-body';
    });

    const body = li.querySelector('.cards-trend-card-body');
    if (body) {
      // First paragraph is the category eyebrow -> pill tag.
      const firstP = body.querySelector('p');
      if (firstP && !firstP.querySelector('a')) firstP.className = 'cards-trend-tag';

      // The source makes the whole card a single link. EDS renders that as a
      // trailing <p><a> duplicating the heading. Turn the entire card into that
      // link and drop the redundant trailing paragraph.
      const links = [...body.querySelectorAll('a')];
      const cardLink = links[links.length - 1];
      if (cardLink) {
        const href = cardLink.getAttribute('href');
        const title = cardLink.getAttribute('title') || cardLink.textContent;
        const trailingP = cardLink.closest('p');
        if (trailingP) trailingP.remove();
        const a = document.createElement('a');
        a.className = 'cards-trend-card-link';
        a.href = href;
        if (title) a.setAttribute('title', title);
        while (li.firstChild) a.append(li.firstChild);
        li.append(a);
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
