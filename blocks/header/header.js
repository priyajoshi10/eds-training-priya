// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Dual-fetch the nav fragment. The root path (/nav.plain.html) resolves on both
 * hosted EDS/DA and local `aem up`, so try it first to avoid a console 404 on
 * hosted pages; fall back to /content/nav.plain.html for any setup that only
 * serves the fragment under /content. Metadata-independent by design.
 */
async function fetchNav() {
  let resp = await fetch('/nav.plain.html');
  if (!resp.ok) resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

/** Close every open section (desktop dropdowns / megamenus). */
function closeAllSections(navSections, except) {
  navSections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    if (drop !== except) drop.setAttribute('aria-expanded', 'false');
  });
}

/** Toggle the whole mobile nav open/closed. */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
  if (expanded || isDesktop.matches) closeAllSections(navSections);
}

/**
 * Wire a section that has a dropdown/megamenu panel.
 * Desktop: hover to open, click to toggle. Mobile: click/tap to expand.
 */
function decorateDrop(navSections, drop) {
  drop.classList.add('nav-drop');
  drop.setAttribute('aria-expanded', 'false');
  const trigger = drop.querySelector(':scope > p');
  if (trigger) trigger.setAttribute('tabindex', '0');

  const open = () => { closeAllSections(navSections, drop); drop.setAttribute('aria-expanded', 'true'); };
  const close = () => drop.setAttribute('aria-expanded', 'false');
  const toggle = () => (drop.getAttribute('aria-expanded') === 'true' ? close() : open());

  drop.addEventListener('mouseenter', () => { if (isDesktop.matches) open(); });
  drop.addEventListener('mouseleave', () => { if (isDesktop.matches) close(); });
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      // only intercept when the label itself (not a child link) is clicked
      if (e.target.closest('a')) return;
      e.preventDefault();
      toggle();
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); toggle(); }
    });
  }
}

/**
 * loads and decorates the header nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // assign brand / sections / tools to the three top-level sections
  ['brand', 'sections', 'tools'].forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand: strip button classes, keep the logo link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) brandLink.classList.add('nav-brand-link');
  }

  // sections: mark items that have a nested panel as dropdowns
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector(':scope > ul')) {
        decorateDrop(navSections, li);
        // a megamenu (nested groups) vs a simple dropdown
        if (li.querySelector(':scope > ul > li > ul')) li.classList.add('nav-megamenu');
      }
    });
  }

  // tools: style the Subscribe link as a button
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const cta = navTools.querySelector('a');
    if (cta) cta.classList.add('nav-cta');
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // close open dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && navSections && !nav.contains(e.target)) closeAllSections(navSections);
  });
  // close on escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (navSections) closeAllSections(navSections);
      if (!isDesktop.matches) toggleMenu(nav, navSections, false);
    }
  });

  // reset state cleanly when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    if (navSections) closeAllSections(navSections);
    document.body.style.overflowY = '';
    nav.setAttribute('aria-expanded', 'false');
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.setAttribute('aria-label', 'Open navigation');
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
