import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Pull the preceding default content (intro heading + lead paragraph) into the
  // block so the whole light band (intro + grid) lives inside one wrapper.
  const wrapper = block.closest('.cards-gallery-wrapper') || block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  let intro = null;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    intro = document.createElement('div');
    intro.className = 'cards-gallery-intro';
    while (prev.firstElementChild) intro.append(prev.firstElementChild);
    prev.remove();
  }

  // Build the image grid as ul > li (one image tile per row).
  const ul = document.createElement('ul');
  ul.className = 'cards-gallery-grid';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-gallery-tile';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      while (cell.firstElementChild) li.append(cell.firstElementChild);
      cell.remove();
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
