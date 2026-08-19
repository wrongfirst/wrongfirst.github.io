/**
 * Directory Landing Page Application Logic
 */

(function () {
  'use strict';

  // --- Devicon Mapping for Programming Languages & Tech Stacks ---
  const DEVICONS = {
    typescript: { class: 'devicon-typescript-plain colored', name: 'TypeScript' },
    ts: { class: 'devicon-typescript-plain colored', name: 'TypeScript' },
    javascript: { class: 'devicon-javascript-plain colored', name: 'JavaScript' },
    js: { class: 'devicon-javascript-plain colored', name: 'JavaScript' },
    python: { class: 'devicon-python-plain colored', name: 'Python' },
    py: { class: 'devicon-python-plain colored', name: 'Python' },
    rust: { class: 'devicon-rust-plain colored', name: 'Rust' },
    html: { class: 'devicon-html5-plain colored', name: 'HTML5' },
    html5: { class: 'devicon-html5-plain colored', name: 'HTML5' },
    css: { class: 'devicon-css3-plain colored', name: 'CSS3' },
    css3: { class: 'devicon-css3-plain colored', name: 'CSS3' },
    node: { class: 'devicon-nodejs-plain colored', name: 'Node.js' },
    nodejs: { class: 'devicon-nodejs-plain colored', name: 'Node.js' },
    git: { class: 'devicon-git-plain colored', name: 'Git' },
    github: { class: 'devicon-github-original', name: 'GitHub' },
    sqlite: { class: 'devicon-sqlite-plain colored', name: 'SQLite' },
    sql: { class: 'devicon-postgresql-plain colored', name: 'SQL' },
    wasm: { class: 'devicon-wasm-original colored', name: 'WebAssembly' },
    webassembly: { class: 'devicon-wasm-original colored', name: 'WebAssembly' },
    c: { class: 'devicon-c-plain colored', name: 'C' },
    cpp: { class: 'devicon-cplusplus-plain colored', name: 'C++' },
    'c++': { class: 'devicon-cplusplus-plain colored', name: 'C++' },
    go: { class: 'devicon-go-original-wordmark colored', name: 'Go' },
    golang: { class: 'devicon-go-original-wordmark colored', name: 'Go' },
    ocaml: { class: 'devicon-ocaml-plain colored', name: 'OCaml' },
    bash: { class: 'devicon-bash-plain colored', name: 'Bash' }
  };

  // --- State ---
  let directoryData = null;

  // --- DOM Elements ---
  const siteTitleEl = document.getElementById('site-title');
  const siteSubtitleEl = document.getElementById('site-subtitle');
  const contentContainer = document.getElementById('content-container');

  // --- Escaping Helper ---
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Render Language Icons Helper ---
  function renderLanguages(languages) {
    if (!Array.isArray(languages) || languages.length === 0) {
      return '';
    }

    const iconsHtml = languages.map((langKey) => {
      const raw = String(langKey).trim();
      const key = raw.toLowerCase();

      // Direct Devicon class support (e.g. "devicon-rust-plain colored")
      if (raw.startsWith('devicon-')) {
        return `<span class="lang-icon" title="${escapeHtml(raw)}" aria-label="${escapeHtml(raw)}"><i class="${escapeHtml(raw)}"></i></span>`;
      }

      // Mapped Devicon definition with native .colored styling
      const iconDef = DEVICONS[key];
      if (iconDef) {
        return `<span class="lang-icon" title="${escapeHtml(iconDef.name)}" aria-label="${escapeHtml(iconDef.name)}"><i class="${iconDef.class}"></i></span>`;
      }

      return `<span class="lang-badge-text">${escapeHtml(raw)}</span>`;
    }).join('');

    return `<div class="item-languages" aria-label="Languages">${iconsHtml}</div>`;
  }

  // --- Fetch / Load Data ---
  async function loadDirectory() {
    // If loaded via links.js (works seamlessly on file:/// and http://)
    if (window.DIRECTORY_DATA) {
      applyData(window.DIRECTORY_DATA);
      return;
    }

    // Fallback to fetch links.json (if running on a server without links.js tag)
    try {
      const res = await fetch('links.json', { cache: 'no-cache' });
      if (!res.ok) {
        throw new Error(`Failed to load links.json (HTTP ${res.status})`);
      }
      const data = await res.json();
      applyData(data);
    } catch (err) {
      console.error(err);
      renderError(err.message || 'Error loading directory data.');
    }
  }

  function applyData(data) {
    directoryData = data;
    if (directoryData.title && siteTitleEl) {
      siteTitleEl.textContent = directoryData.title;
      document.title = directoryData.title;
    }
    if (directoryData.subtitle && siteSubtitleEl) {
      siteSubtitleEl.textContent = directoryData.subtitle;
    }
    render();
  }

  // --- Render Functions ---
  function renderError(message) {
    contentContainer.innerHTML = `
      <div class="error-state">
        <p><strong>Unable to load directory</strong></p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function render() {
    if (!directoryData || !Array.isArray(directoryData.sections)) {
      renderError('Invalid data format in links.json.');
      return;
    }

    const renderedSections = directoryData.sections.map((section) => {
      const items = Array.isArray(section.items) ? section.items : [];
      return renderSection(section, items);
    });

    if (renderedSections.length === 0) {
      contentContainer.innerHTML = `
        <div class="empty-state">
          <p>No applications configured yet.</p>
        </div>
      `;
    } else {
      contentContainer.innerHTML = renderedSections.join('');
    }
  }

  function renderSection(section, items) {
    const sectionTitle = escapeHtml(section.title || 'Untitled Section');

    const itemsHtml = items.map((item) => {
      const name = escapeHtml(item.name || 'Unnamed');
      const url = escapeHtml(item.url || '#');
      const desc = escapeHtml(item.description || '');
      const isExternal = item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'));
      const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      const arrowIcon = `<span class="link-arrow" aria-hidden="true">${isExternal ? '↗' : '→'}</span>`;
      const languagesHtml = renderLanguages(item.languages);

      return `
        <li class="directory-item">
          <div class="item-content">
            <h3 class="item-title">
              <a href="${url}" class="item-link"${targetAttr}>
                ${name} ${arrowIcon}
              </a>
            </h3>
            <p class="item-desc">${desc}</p>
          </div>
          ${languagesHtml}
        </li>
      `;
    }).join('');

    return `
      <section class="section-block">
        <div class="section-header">
          <h2 class="section-title">${sectionTitle}</h2>
        </div>
        <ul class="directory-list">
          ${itemsHtml}
        </ul>
      </section>
    `;
  }

  // --- Init ---
  loadDirectory();
})();
