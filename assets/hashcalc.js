/* ============================================================
   hashcalc.js — live hash-calculator widget for this book
   Computation sources:
     Web Crypto API  — SHA family, HMAC, PBKDF2
     MD5lib / RMD160lib (bundled) — MD5, RIPEMD-160 (+ HMAC)
     js-sha3 (CDN)   — SHA-3, Keccak

   Two ways to mount a calculator into an empty <div id="...">:
     HashCalc.mount(id, config)        message (+ optional key) → rows of digests
     HashCalc.mountCustom(id, config)  any input fields → one computed output
   Chapter wiring lives in assets/book.js.
   ============================================================ */
const HashCalc = (function () {
  "use strict";
  const enc = new TextEncoder();

  // ---- encoding helpers ----
  const toHex = buf =>
    [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const encode = (buf, fmt) => (fmt === "b64" ? toB64(buf) : toHex(buf));
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // ---- Web Crypto primitives ----
  const digest = (algo, msg) => crypto.subtle.digest(algo, enc.encode(msg));

  async function hmac(algo, keyStr, msg) {
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(keyStr), { name: "HMAC", hash: algo }, false, ["sign"]);
    return crypto.subtle.sign("HMAC", key, enc.encode(msg));
  }

  async function pbkdf2(passStr, saltStr, iterations, bytes, hash) {
    const base = await crypto.subtle.importKey(
      "raw", enc.encode(passStr), "PBKDF2", false, ["deriveBits"]);
    return crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: enc.encode(saltStr), iterations: +iterations, hash },
      base, bytes * 8);
  }

  // spec.kind: "webcrypto" | "lib" | "sha3"
  async function compute(spec, msg, key, fmt) {
    if (spec.kind === "webcrypto") {
      const buf = spec.keyed ? await hmac(spec.algo, key, msg) : await digest(spec.algo, msg);
      return encode(buf, fmt);
    }
    if (spec.kind === "lib") {
      return spec.keyed ? spec.fn(key, msg) : spec.fn(msg); // always hex
    }
    if (spec.kind === "sha3") {
      if (typeof sha3_256 !== "function") throw new Error("library failed to load");
      return spec.fn(msg); // always hex
    }
    throw new Error("unknown spec kind: " + spec.kind);
  }

  // ---- shared UI pieces ----
  const rowHTML = (id, name, sub) => `<div class="hc-row">
      <div class="hc-name">${esc(name)}${sub ? `<small>${esc(sub)}</small>` : ""}</div>
      <div class="hc-out" id="${id}" aria-live="polite"></div>
      <button type="button" class="hc-copy" data-for="${id}" title="Copy" aria-label="Copy ${esc(name)}">⧉</button>
    </div>`;

  const fieldHTML = (id, f) => `<div class="hc-field">
      <label for="${id}">${esc(f.label)}</label>
      <input class="hc-input" id="${id}" type="${f.type || "text"}"
        ${f.min != null ? `min="${f.min}"` : ""} ${f.max != null ? `max="${f.max}"` : ""}
        ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ""}
        value="${esc(f.value != null ? f.value : "")}" autocomplete="off" spellcheck="false">
    </div>`;

  function debounce(fn, ms) {
    let t;
    return () => { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  function wireCopy(host) {
    host.addEventListener("click", async e => {
      const btn = e.target.closest(".hc-copy");
      if (!btn) return;
      const out = host.querySelector("#" + CSS.escape(btn.dataset.for));
      const txt = out && !out.classList.contains("hc-err") ? out.textContent : "";
      if (!txt) return;
      try {
        await navigator.clipboard.writeText(txt);
        btn.classList.add("hc-done");
        setTimeout(() => btn.classList.remove("hc-done"), 900);
      } catch (_) { /* clipboard unavailable */ }
    });
  }

  function setOut(el, text, isErr) {
    el.textContent = text;
    el.classList.toggle("hc-err", !!isErr);
  }

  /*
    mount(containerId, {
      title, placeholder, sample,
      keyed, keyLabel, keyDefault,
      encoding,                      // hex/base64 toggle (affects webcrypto rows)
      rows: [{ id, label, sub, spec }]
    })
  */
  function mount(containerId, config) {
    const host = document.getElementById(containerId);
    if (!host) return;
    const cid = containerId;
    const showEnc = config.encoding && config.rows.some(r => r.spec.kind === "webcrypto");

    let html = `<div class="hc">`;
    if (config.title) html += `<div class="hc-title">${esc(config.title)}</div>`;
    html += fieldHTML(`${cid}-msg`, { label: "input text", placeholder: config.placeholder || "type a message…", value: config.sample || "" });
    if (config.keyed) html += fieldHTML(`${cid}-key`, { label: config.keyLabel || "key", value: config.keyDefault || "" });
    if (showEnc) {
      html += `<div class="hc-controls" role="radiogroup" aria-label="Output encoding">
        <span>output:</span>
        <label><input type="radio" name="${cid}-enc" value="hex" checked> hex</label>
        <label><input type="radio" name="${cid}-enc" value="b64"> base64</label>
      </div>`;
    }
    html += `<div class="hc-rows">${config.rows.map(r => rowHTML(`${cid}-out-${r.id}`, r.label, r.sub)).join("")}</div></div>`;
    host.innerHTML = html;

    const msgEl = host.querySelector(`#${cid}-msg`);
    const keyEl = config.keyed ? host.querySelector(`#${cid}-key`) : null;
    const encEls = [...host.querySelectorAll(`input[name="${cid}-enc"]`)];
    const currentEnc = () => (encEls.find(e => e.checked) || { value: "hex" }).value;

    let generation = 0; // only the latest refresh may write its results
    async function refresh() {
      const gen = ++generation;
      const msg = msgEl.value, key = keyEl ? keyEl.value : "", fmt = currentEnc();
      const results = await Promise.all(config.rows.map(r =>
        compute(r.spec, msg, key, fmt).then(v => [v, false], e => [e.message || "error", true])));
      if (gen !== generation) return;
      config.rows.forEach((r, i) =>
        setOut(host.querySelector(`#${cid}-out-${r.id}`), results[i][0], results[i][1]));
    }

    const deb = debounce(refresh, 70);
    msgEl.addEventListener("input", deb);
    if (keyEl) keyEl.addEventListener("input", deb);
    encEls.forEach(e => e.addEventListener("change", refresh));
    wireCopy(host);
    refresh();
  }

  /*
    mountCustom(containerId, {
      title,
      fields: [{ id, label, type, value, min, max, placeholder }],
      output: { label, sub },
      compute: async values => "result string"   // throw Error to show a message
    })
  */
  function mountCustom(containerId, config) {
    const host = document.getElementById(containerId);
    if (!host) return;
    const cid = containerId;
    const outId = `${cid}-out`;

    host.innerHTML = `<div class="hc">
      ${config.title ? `<div class="hc-title">${esc(config.title)}</div>` : ""}
      ${config.fields.map(f => fieldHTML(`${cid}-${f.id}`, f)).join("")}
      <div class="hc-rows">${rowHTML(outId, config.output.label, config.output.sub)}</div>
    </div>`;

    const out = host.querySelector("#" + outId);
    const inputs = config.fields.map(f => host.querySelector(`#${cid}-${f.id}`));

    let generation = 0;
    async function run() {
      const gen = ++generation;
      const values = {};
      config.fields.forEach((f, i) => {
        values[f.id] = f.type === "number" ? Number(inputs[i].value) : inputs[i].value;
      });
      setOut(out, "computing…", false);
      let text, isErr = false;
      try { text = await config.compute(values); }
      catch (e) { text = e.message || "error"; isErr = true; }
      if (gen === generation) setOut(out, text, isErr);
    }

    const deb = debounce(run, 120);
    inputs.forEach(el => el.addEventListener("input", deb));
    wireCopy(host);
    run();
  }

  return { mount, mountCustom, toHex, pbkdf2 };
})();
