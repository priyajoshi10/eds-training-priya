export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows[0];
  const textRow = rows[rows.length - 1];

  const hasImage = block.querySelector(':scope > div picture, :scope > div img');

  if (imageRow && hasImage && imageRow !== textRow) {
    imageRow.classList.add('hero-overlay-image');
  }
  if (textRow) {
    textRow.classList.add('hero-overlay-content');
  }

  // Wrap all rows into a single rounded card so the image, gradient overlay
  // and text can be layered on top of one another.
  const card = document.createElement('div');
  card.className = 'hero-overlay-card';
  rows.forEach((row) => card.append(row));
  block.append(card);

  if (!hasImage) {
    block.classList.add('no-image');
  }
}
