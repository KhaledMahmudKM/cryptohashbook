/* ============================================================
   hashcalc.js — shared live-calculator engine for the book
   Reuses: Web Crypto API (SHA family, HMAC, PBKDF2),
           MD5lib / RMD160lib (bundled), js-sha3 (CDN).
   A chapter page calls HashCalc.mount(containerId, config).
   ============================================================ */
const HashCalc = (function () {
  const enc = new TextEncoder();

  // ---- encoding helpers ----
  const toHex = buf =>
    [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const encode = (buf, fmt) => (fmt === "b64" ? toB64(buf) : toHex(buf));

  // ---- native (Web Crypto) digest ----
  async function digest(algo, msg) {
    const buf = await crypto.subtle.digest(algo, enc.encode(msg));
    return buf;
  }
  // ---- native HMAC ----
  async function hmac(algo, keyStr, msg) {
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(keyStr), { name: "HMAC", hash: algo }, false, ["sign"]);
    return crypto.subtle.sign("HMAC", key, enc.encode(msg));
  }
  // ---- native PBKDF2 ----
  async function pbkdf2(passStr, saltStr, iterations, bytes, hash) {
    const base = await crypto.subtle.importKey(
      "raw", enc.encode(passStr), "PBKDF2", false, ["deriveBits"]);
    return crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: enc.encode(saltStr), iterations: +iterations, hash },
      base, bytes * 8);
  }

  const sha3Ready = () => typeof sha3_256 === "function";

  // Resolve a computation spec to a function returning a hex/encoded string.
  // spec.kind: "webcrypto" | "lib" | "sha3"
  async function compute(spec, msg, key, fmt) {
    if (spec.kind === "webcrypto") {
      const buf = spec.keyed ? await hmac(spec.algo, key, msg)
                             : await digest(spec.algo, msg);
      return encode(buf, fmt);
    }
    if (spec.kind === "lib") {
      // synchronous library call; always hex
      return spec.keyed ? spec.fn(key, msg) : spec.fn(msg);
    }
    if (spec.kind === "sha3") {
      if (!sha3Ready()) throw new Error("js-sha3 not loaded");
      return spec.fn(msg); // always hex
    }
    throw new Error("unknown spec kind: " + spec.kind);
  }

  function rowHTML(id, name, sub, canEncode) {
    return `<div class="hc-row">
      <div class="hc-name">${name}${sub ? `<small>${sub}</small>` : ""}</div>
      <div class="hc-out" id="${id}"></div>
      <button class="hc-copy" data-for="${id}" title="Copy" aria-label="Copy ${name}">⧉</button>
    </div>`;
  }

  function debounce(fn, ms) { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; }

  /*
    config = {
      title:        optional heading above the calculator,
      placeholder:  input placeholder,
      sample:       optional prefilled input,
      keyed:        show a key field? (bool)
      keyLabel:     label for key field (default "key"),
      keyDefault:   prefilled key,
      encoding:     show hex/base64 toggle? (bool, only affects webcrypto rows),
      rows: [ { id, label, sub, spec } ... ]
    }
  */
  function mount(containerId, config) {
    const host = document.getElementById(containerId);
    if (!host) return;
    const cid = containerId;
    const anyEncodeable = config.encoding &&
      config.rows.some(r => r.spec.kind === "webcrypto");

    let html = `<div class="hc">`;
    if (config.title) html += `<div class="hc-title">${config.title}</div>`;
    html += `<div class="hc-field">
      <label for="${cid}-msg">input text</label>
      <input class="hc-input" type="text" id="${cid}-msg"
             placeholder="${config.placeholder || "type a message…"}"
             autocomplete="off" spellcheck="false">
    </div>`;
    if (config.keyed) {
      html += `<div class="hc-field">
        <label for="${cid}-key">${config.keyLabel || "key"}</label>
        <input class="hc-input" type="text" id="${cid}-key"
               value="${config.keyDefault || ""}" autocomplete="off" spellcheck="false">
      </div>`;
    }
    if (anyEncodeable) {
      html += `<div class="hc-controls" role="radiogroup" aria-label="Output encoding">
        <span>output:</span>
        <label><input type="radio" name="${cid}-enc" value="hex" checked> hex</label>
        <label><input type="radio" name="${cid}-enc" value="b64"> base64</label>
      </div>`;
    }
    html += `<div class="hc-rows">`;
    for (const r of config.rows) {
      html += rowHTML(`${cid}-out-${r.id}`, r.label, r.sub || "");
    }
    html += `</div></div>`;
    host.innerHTML = html;

    const msgEl = document.getElementById(`${cid}-msg`);
    const keyEl = config.keyed ? document.getElementById(`${cid}-key`) : null;
    const encEls = anyEncodeable
      ? [...host.querySelectorAll(`input[name="${cid}-enc"]`)] : [];

    const currentEnc = () =>
      (encEls.find(e => e.checked) || { value: "hex" }).value;

    async function refresh() {
      const msg = msgEl.value;
      const key = keyEl ? keyEl.value : "";
      const fmt = currentEnc();
      for (const r of config.rows) {
        const el = document.getElementById(`${cid}-out-${r.id}`);
        try {
          el.textContent = await compute(r.spec, msg, key, fmt);
          el.classList.remove("hc-err");
        } catch (e) {
          el.textContent = (r.spec.kind === "sha3")
            ? "library failed to load" : "error";
          el.classList.add("hc-err");
        }
      }
    }

    const deb = debounce(refresh, 70);
    msgEl.addEventListener("input", deb);
    if (keyEl) keyEl.addEventListener("input", deb);
    encEls.forEach(e => e.addEventListener("change", refresh));

    // copy buttons
    host.addEventListener("click", async (e) => {
      const btn = e.target.closest(".hc-copy");
      if (!btn) return;
      const txt = document.getElementById(btn.dataset.for).textContent;
      if (!txt) return;
      try {
        await navigator.clipboard.writeText(txt);
        btn.classList.add("hc-done");
        setTimeout(() => btn.classList.remove("hc-done"), 900);
      } catch (_) {}
    });

    if (config.sample) { msgEl.value = config.sample; }
    refresh();
  }

  return { mount };
})();
