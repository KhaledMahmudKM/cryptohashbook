let bookMeta = {};
let chapterFiles = []; // Only actual chapter files (no separators)
let currentChapterIndex = -1; // Index into chapterFiles[]

// ── Theme (light/dark) ──────────────────────────────────────
const SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("kmbooks-theme", theme);

  const btn = document.getElementById("theme-toggle");
  if (btn) btn.innerHTML = theme === "light" ? MOON_ICON : SUN_ICON;

  // Swap the highlight.js color theme to match
  const hljsLight = document.getElementById("hljs-light-theme");
  const hljsDark = document.getElementById("hljs-dark-theme");
  if (hljsLight && hljsDark) {
    hljsLight.disabled = theme === "dark";
    hljsDark.disabled = theme !== "dark";
  }
}

function initThemeToggle() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  setTheme(current);

  const btn = document.getElementById("theme-toggle");
  btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    setTheme(next);
  });
}

async function loadBookMeta() {
  const response = await fetch("book.json");
  bookMeta = await response.json();
  document.title = bookMeta.title;
  document.getElementById("book-title").textContent = bookMeta.title;
  document.getElementById("book-copyright").textContent = bookMeta.copyright;
}

// ── Live hash calculators ───────────────────────────────────
// Chapters that use the shared HashCalc.mount() engine just need their
// container id + a declarative config, mirroring each chapter's original
// standalone <script>HashCalc.mount(...)</script> call.
const HASHCALC_CONFIGS = {
  "01-what-a-hash-is.md": ["calc1", {
    placeholder: "try: hello", sample: "hello",
    rows: [{ id: "sha256", label: "SHA-256", sub: "256-bit", spec: { kind: "webcrypto", algo: "SHA-256" } }]
  }],
  "02-anatomy-of-a-digest.md": ["calc2", {
    placeholder: "compare the sizes…", sample: "crypto", encoding: true,
    rows: [
      { id: "s256", label: "SHA-256", sub: "256-bit", spec: { kind: "webcrypto", algo: "SHA-256" } },
      { id: "s384", label: "SHA-384", sub: "384-bit", spec: { kind: "webcrypto", algo: "SHA-384" } },
      { id: "s512", label: "SHA-512", sub: "512-bit", spec: { kind: "webcrypto", algo: "SHA-512" } }
    ]
  }],
  "03-md5.md": ["calc3", {
    placeholder: "try: abc", sample: "abc", keyed: true, keyLabel: "HMAC key", keyDefault: "secret",
    rows: [
      { id: "md5", label: "MD5", sub: "128-bit", spec: { kind: "lib", fn: s => MD5lib.hex_md5(s) } },
      { id: "hmd5", label: "HMAC-MD5", sub: "128-bit · keyed", spec: { kind: "lib", keyed: true, fn: (k, s) => MD5lib.hex_hmac_md5(k, s) } }
    ]
  }],
  "04-sha1-and-sha2.md": ["calc4", {
    placeholder: "try: abc", sample: "abc", keyed: true, keyLabel: "HMAC key", keyDefault: "secret", encoding: true,
    rows: [
      { id: "s1", label: "SHA-1", sub: "160-bit", spec: { kind: "webcrypto", algo: "SHA-1" } },
      { id: "s256", label: "SHA-256", sub: "256-bit", spec: { kind: "webcrypto", algo: "SHA-256" } },
      { id: "s512", label: "SHA-512", sub: "512-bit", spec: { kind: "webcrypto", algo: "SHA-512" } },
      { id: "h1", label: "HMAC-SHA1", sub: "keyed", spec: { kind: "webcrypto", algo: "SHA-1", keyed: true } },
      { id: "h256", label: "HMAC-SHA256", sub: "keyed", spec: { kind: "webcrypto", algo: "SHA-256", keyed: true } }
    ]
  }],
  "05-sha3-and-keccak.md": ["calc5", {
    placeholder: "try: abc", sample: "abc",
    rows: [
      { id: "s3_256", label: "SHA3-256", sub: "256-bit", spec: { kind: "sha3", fn: s => sha3_256(s) } },
      { id: "s3_512", label: "SHA3-512", sub: "512-bit", spec: { kind: "sha3", fn: s => sha3_512(s) } },
      { id: "k256", label: "Keccak-256", sub: "256-bit · Ethereum", spec: { kind: "sha3", fn: s => keccak256(s) } }
    ]
  }],
  "06-ripemd-160.md": ["calc6", {
    placeholder: "try: abc", sample: "abc", keyed: true, keyLabel: "HMAC key", keyDefault: "secret",
    rows: [
      { id: "rmd", label: "RIPEMD-160", sub: "160-bit", spec: { kind: "lib", fn: s => RMD160lib.hex_rmd160(s) } },
      { id: "hrmd", label: "HMAC-RIPEMD160", sub: "160-bit · keyed", spec: { kind: "lib", keyed: true, fn: (k, s) => RMD160lib.hex_hmac_rmd160(k, s) } }
    ]
  }],
  "07-hmac.md": ["calc7", {
    placeholder: "message to authenticate…", sample: "The quick brown fox", keyed: true, keyLabel: "key", keyDefault: "key",
    rows: [
      { id: "hmd5", label: "HMAC-MD5", sub: "128-bit", spec: { kind: "lib", keyed: true, fn: (k, s) => MD5lib.hex_hmac_md5(k, s) } },
      { id: "h1", label: "HMAC-SHA1", sub: "160-bit", spec: { kind: "webcrypto", algo: "SHA-1", keyed: true } },
      { id: "h256", label: "HMAC-SHA256", sub: "256-bit", spec: { kind: "webcrypto", algo: "SHA-256", keyed: true } },
      { id: "h512", label: "HMAC-SHA512", sub: "512-bit", spec: { kind: "webcrypto", algo: "SHA-512", keyed: true } }
    ]
  }]
};

// Chapters 8 and 9 build their own bespoke input/output wiring (declared
// directly in their markdown as plain HTML) rather than using HashCalc.mount().
function initPbkdf2Calculator() {
  const enc = new TextEncoder();
  const $ = id => document.getElementById(id);
  const toHex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  async function run() {
    const out = $("pb-out");
    const p = $("pb-pass").value, s = $("pb-salt").value;
    const it = +$("pb-iter").value, by = +$("pb-bytes").value;
    if (!p || !s) { out.textContent = "enter a password and salt"; out.classList.add("hc-err"); return; }
    out.classList.remove("hc-err"); out.textContent = "computing…";
    try {
      const base = await crypto.subtle.importKey("raw", enc.encode(p), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(s), iterations: it, hash: "SHA-256" }, base, by * 8);
      out.textContent = toHex(bits);
    } catch (e) { out.textContent = "error: " + e.message; out.classList.add("hc-err"); }
  }
  let t; const deb = () => { clearTimeout(t); t = setTimeout(run, 120); };
  ["pb-pass", "pb-salt", "pb-iter", "pb-bytes"].forEach(id => $(id).addEventListener("input", deb));
  $("pbkdf2box").addEventListener("click", async e => {
    const b = e.target.closest(".hc-copy"); if (!b) return;
    const tx = $(b.dataset.for).textContent;
    if (tx) { try { await navigator.clipboard.writeText(tx); b.classList.add("hc-done"); setTimeout(() => b.classList.remove("hc-done"), 900); } catch (_) {} }
  });
  run();
}

function initWpaCalculator() {
  const enc = new TextEncoder();
  const $ = id => document.getElementById(id);
  const toHex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  async function run() {
    const out = $("wp-out");
    const p = $("wp-pass").value, s = $("wp-ssid").value;
    if (!p || !s) { out.textContent = "enter passphrase and SSID"; out.classList.add("hc-err"); return; }
    out.classList.remove("hc-err"); out.textContent = "computing…";
    try {
      const base = await crypto.subtle.importKey("raw", enc.encode(p), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(s), iterations: 4096, hash: "SHA-1" }, base, 32 * 8);
      out.textContent = toHex(bits);
    } catch (e) { out.textContent = "error: " + e.message; out.classList.add("hc-err"); }
  }
  let t; const deb = () => { clearTimeout(t); t = setTimeout(run, 120); };
  ["wp-pass", "wp-ssid"].forEach(id => $(id).addEventListener("input", deb));
  $("wpabox").addEventListener("click", async e => {
    const b = e.target.closest(".hc-copy"); if (!b) return;
    const tx = $(b.dataset.for).textContent;
    if (tx) { try { await navigator.clipboard.writeText(tx); b.classList.add("hc-done"); setTimeout(() => b.classList.remove("hc-done"), 900); } catch (_) {} }
  });
  run();
}

const CHAPTER_INIT = {
  "08-pbkdf2.md": initPbkdf2Calculator,
  "09-wpa-psk.md": initWpaCalculator
};

// Called after a chapter's HTML is inserted into #content, so any
// interactive widget it contains gets wired up.
function initChapterExtras(path) {
  const file = path.split("/").pop();
  if (HASHCALC_CONFIGS[file]) {
    const [containerId, config] = HASHCALC_CONFIGS[file];
    if (window.HashCalc) HashCalc.mount(containerId, config);
  }
  if (CHAPTER_INIT[file]) {
    CHAPTER_INIT[file]();
  }
}

// Load and render a markdown file into the content pane
function loadMarkdown(path, index) {
  // Update active state in sidebar
  document.querySelectorAll(".sidebar ul li a.toc-link").forEach(a => a.classList.remove("active"));
  if (index !== undefined) {
    currentChapterIndex = index;
    if (index >= 0) {
      const links = document.querySelectorAll(".sidebar ul li a.toc-link");
      links.forEach(a => {
        if (parseInt(a.dataset.index) === index) a.classList.add("active");
      });
    }
  }

  updateNavArrows();

  fetch(path)
    .then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.text();
    })
    .then(markdown => {
      const html = marked.parse(markdown);
      document.getElementById("content").innerHTML =
        buildNavBar("top") + `<div class="chapter-body">${html}</div>` + buildNavBar("bottom");

      // Re-attach nav button listeners
      attachNavListeners();

      hljs.highlightAll();

      // Wire up this chapter's live calculator, if it has one
      initChapterExtras(path);

      // Re-typeset MathJax if available
      if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([document.getElementById("content")]);
      }

      // Scroll content area to top
      document.getElementById("content").scrollTop = 0;
      window.scrollTo(0, 0);
    })
    .catch(err => {
      document.getElementById("content").innerHTML = `<p>Error loading file: ${err}</p>`;
      console.error(err);
    });
}

// Build a prev/next navigation bar HTML string
function buildNavBar(position) {
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex >= 0 && currentChapterIndex < chapterFiles.length - 1;
  // For "home" (index === -1), next is index 0
  const isHome = currentChapterIndex === -1;
  const showNext = hasNext || isHome;

  return `
    <div class="chapter-nav chapter-nav--${position}">
      <button class="nav-btn nav-btn--prev" data-action="prev" ${hasPrev ? "" : "disabled"}>
        <span class="nav-arrow">&#8592;</span>
        <span class="nav-label">${hasPrev ? chapterFiles[currentChapterIndex - 1].title : "Previous"}</span>
      </button>
      <button class="nav-btn nav-btn--next" data-action="next" ${showNext ? "" : "disabled"}>
        <span class="nav-label">${isHome && chapterFiles.length > 0 ? chapterFiles[0].title : (hasNext ? chapterFiles[currentChapterIndex + 1].title : "Next")}</span>
        <span class="nav-arrow">&#8594;</span>
      </button>
    </div>`;
}

function attachNavListeners() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      if (action === "prev" && currentChapterIndex > 0) {
        const prev = chapterFiles[currentChapterIndex - 1];
        loadMarkdown(prev.path, currentChapterIndex - 1);
      } else if (action === "next") {
        const nextIndex = currentChapterIndex === -1 ? 0 : currentChapterIndex + 1;
        if (nextIndex < chapterFiles.length) {
          const next = chapterFiles[nextIndex];
          loadMarkdown(next.path, nextIndex);
        }
      }
    });
  });
}

function updateNavArrows() {
  // Nav bars are rebuilt on each load, so nothing extra needed here
}

async function generateTOC() {
  const response = await fetch("chapters/chapters.json");
  const entries = await response.json();
  const toc = document.getElementById("toc");

  // Home link
  const homeLi = document.createElement("li");
  const homeA = document.createElement("a");
  homeA.href = "#";
  homeA.textContent = "Preface";
  homeA.className = "toc-link";
  homeA.dataset.index = "-1";
  homeA.addEventListener("click", e => {
    e.preventDefault();
    loadMarkdown("chapters/home.md", -1);
  });
  homeLi.appendChild(homeA);
  toc.appendChild(homeLi);

  // Remember which Parts the reader has collapsed, per book
  const storageKey = "kmbooks-toc-collapsed:" + (bookMeta.title || location.pathname);
  let collapsedParts = [];
  try {
    collapsedParts = JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch (e) { /* ignore malformed storage */ }

  function saveCollapsedState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(collapsedParts));
    } catch (e) { /* storage unavailable — ignore */ }
  }

  // Process entries: strings = chapter file, objects with "separator" key = a
  // Part divider that starts a new collapsible group.
  let chapterIndex = 0;
  let currentGroupList = null; // <ul> currently receiving chapter <li>s (null = top level)

  for (const entry of entries) {
    // --- Separator: starts a new collapsible Part group ---
    if (typeof entry === "object" && entry.separator) {
      const label = entry.separator;
      const groupLi = document.createElement("li");
      groupLi.className = "toc-group";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "toc-group-toggle";

      const chevron = document.createElement("span");
      chevron.className = "toc-chevron";
      chevron.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

      const labelSpan = document.createElement("span");
      labelSpan.textContent = label;

      toggle.appendChild(chevron);
      toggle.appendChild(labelSpan);

      const groupList = document.createElement("ul");
      groupList.className = "toc-group-list";

      const isCollapsed = collapsedParts.includes(label);
      groupLi.classList.toggle("collapsed", isCollapsed);
      toggle.setAttribute("aria-expanded", String(!isCollapsed));

      toggle.addEventListener("click", () => {
        const collapsed = groupLi.classList.toggle("collapsed");
        toggle.setAttribute("aria-expanded", String(!collapsed));
        collapsedParts = collapsed
          ? [...new Set([...collapsedParts, label])]
          : collapsedParts.filter(l => l !== label);
        saveCollapsedState();
      });

      groupLi.appendChild(toggle);
      groupLi.appendChild(groupList);
      toc.appendChild(groupLi);

      currentGroupList = groupList;
      continue;
    }

    // --- Chapter file (string or object with "file") ---
    const file = typeof entry === "string" ? entry : entry.file;
    const chapterPath = `chapters/${file}`;

    // Fetch and extract heading
    let title = file.replace(".md", "");
    try {
      const mdResponse = await fetch(chapterPath);
      const markdown = await mdResponse.text();
      const match = markdown.match(/^#\s+(.*)/m);
      if (match) title = match[1];
    } catch (e) { /* keep filename as title */ }

    // Store in chapterFiles array
    const idx = chapterIndex++;
    chapterFiles.push({ file, path: chapterPath, title });

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = title;
    a.className = "toc-link";
    a.dataset.index = idx;
    a.addEventListener("click", e => {
      e.preventDefault();
      loadMarkdown(chapterPath, idx);
    });
    li.appendChild(a);
    (currentGroupList || toc).appendChild(li);
  }
}

// Configure marked + highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

// MathJax config
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  svg: { fontCache: 'global' }
};

async function initializeBook() {
  initThemeToggle();
  await loadBookMeta();
  await generateTOC();
  loadMarkdown("chapters/home.md", -1);
  initSidebarToggle();
}

// ── Mobile sidebar open/close ───────────────────────────────
function initSidebarToggle() {
  const toggle   = document.getElementById("sidebar-toggle");
  const closeBtn = document.getElementById("sidebar-close");
  const sidebar  = document.getElementById("sidebar");
  const overlay  = document.getElementById("sidebar-overlay");

  function openSidebar() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-visible");
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", () => {
    sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar();
  });

  closeBtn.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  // Close sidebar when a chapter link is tapped on mobile
  sidebar.addEventListener("click", e => {
    if (e.target.classList.contains("toc-link") && window.innerWidth <= 768) {
      closeSidebar();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSidebar();
  });
}

initializeBook();
