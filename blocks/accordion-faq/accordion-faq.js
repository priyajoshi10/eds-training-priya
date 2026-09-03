/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

export default function decorate(block) {
  // Pull the preceding default content (intro heading + lead paragraph) into the
  // block so the whole section (intro + accordion items) shares one padded wrapper.
  const wrapper = block.closest('.accordion-faq-wrapper') || block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  let intro = null;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    intro = document.createElement('div');
    intro.className = 'accordion-faq-intro';
    while (prev.firstElementChild) intro.append(prev.firstElementChild);
    prev.remove();
  }

  const items = [...block.children].map((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-faq-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    return details;
  });

  block.textContent = '';
  if (intro) block.append(intro);
  const list = document.createElement('div');
  list.className = 'accordion-faq-list';
  list.append(...items);
  block.append(list);
}
