export default function decorate(block) {
  const rows = [...block.children];
  const textRow = rows[rows.length - 1];
  const content = textRow.querySelector(':scope > div') || textRow;

  // First paragraph after the heading is the subheading
  const heading = content.querySelector('h1, h2, h3');
  if (heading) {
    const sub = heading.nextElementSibling;
    if (sub && sub.tagName === 'P' && !sub.querySelector('a')) {
      sub.classList.add('subheading');
    }
  }

  // Turn the CTA links into pill buttons and group them
  const linkParas = [...content.querySelectorAll(':scope > p')].filter(
    (p) => p.querySelector(':scope > a') && p.textContent.trim() === p.querySelector('a').textContent.trim(),
  );

  if (linkParas.length) {
    const group = document.createElement('div');
    group.className = 'hero-split-buttons';
    linkParas.forEach((p, i) => {
      const a = p.querySelector('a');
      a.classList.add('button', i === 0 ? 'primary' : 'secondary');
      group.append(a);
      p.remove();
    });
    content.append(group);
  }
}
