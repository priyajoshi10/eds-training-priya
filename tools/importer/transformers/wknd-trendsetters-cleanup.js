/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters.site site-wide cleanup.
 * Removes non-authorable site chrome and build artifacts.
 * All selectors verified against migration-work/cleaned.html.
 *
 * NOTE: The authorable hero lives at `#main-content > header.section.secondary-section`.
 * We therefore NEVER remove a bare `header` — only the global `.navbar` shell and
 * `.footer` are stripped. Breadcrumbs embedded in content are removed by class.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Global site chrome (siblings of <main>) and in-content non-authorable nav.
    // Found in cleaned.html: <div class="navbar">, <footer class="footer inverse-footer">,
    // <a class="skip-link">, <div class="breadcrumbs"> (inside columns-media section).
    WebImporter.DOMUtils.remove(element, [
      '.navbar',
      'footer.footer',
      'a.skip-link',
      '.breadcrumbs',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Strip Astro build-time attributes present throughout the captured DOM
    // (e.g. data-astro-cid-37fxchfa on <body>, data-astro-cid-rbygaycu on svg lines).
    element.querySelectorAll('[data-astro-cid-37fxchfa], [data-astro-cid-rbygaycu]').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith('data-astro-cid')) el.removeAttribute(attr.name);
      });
    });

    // Safe non-authorable leftover elements, if present in DOM.
    WebImporter.DOMUtils.remove(element, ['noscript', 'link', 'iframe']);
  }
}
