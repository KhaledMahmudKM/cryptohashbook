/* ============================================================
   book.js — chapter wiring for the hash book.
   Each chapter's markdown contains an empty <div id="calcN"></div>;
   the engine calls these hooks after rendering that chapter.
   ============================================================ */
(function () {
  "use strict";

  const webcrypto = (algo, keyed) => ({ kind: "webcrypto", algo, keyed: !!keyed });

  const CALCS = {
    "01-what-a-hash-is.md": ["calc1", {
      placeholder: "try: hello", sample: "hello",
      rows: [{ id: "sha256", label: "SHA-256", sub: "256-bit", spec: webcrypto("SHA-256") }]
    }],
    "02-anatomy-of-a-digest.md": ["calc2", {
      placeholder: "compare the sizes…", sample: "crypto", encoding: true,
      rows: [
        { id: "s256", label: "SHA-256", sub: "256-bit", spec: webcrypto("SHA-256") },
        { id: "s384", label: "SHA-384", sub: "384-bit", spec: webcrypto("SHA-384") },
        { id: "s512", label: "SHA-512", sub: "512-bit", spec: webcrypto("SHA-512") }
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
        { id: "s1", label: "SHA-1", sub: "160-bit", spec: webcrypto("SHA-1") },
        { id: "s256", label: "SHA-256", sub: "256-bit", spec: webcrypto("SHA-256") },
        { id: "s512", label: "SHA-512", sub: "512-bit", spec: webcrypto("SHA-512") },
        { id: "h1", label: "HMAC-SHA1", sub: "keyed", spec: webcrypto("SHA-1", true) },
        { id: "h256", label: "HMAC-SHA256", sub: "keyed", spec: webcrypto("SHA-256", true) }
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
        { id: "h1", label: "HMAC-SHA1", sub: "160-bit", spec: webcrypto("SHA-1", true) },
        { id: "h256", label: "HMAC-SHA256", sub: "256-bit", spec: webcrypto("SHA-256", true) },
        { id: "h512", label: "HMAC-SHA512", sub: "512-bit", spec: webcrypto("SHA-512", true) }
      ]
    }]
  };

  const CUSTOM = {
    "08-pbkdf2.md": ["calc8", {
      title: "PBKDF2 key derivation",
      fields: [
        { id: "pass", label: "password", value: "password", placeholder: "passphrase…" },
        { id: "salt", label: "salt", value: "salt" },
        { id: "iter", label: "iterations", type: "number", min: 1, max: 1000000, value: 100000 },
        { id: "bytes", label: "key bytes", type: "number", min: 1, max: 256, value: 32 }
      ],
      output: { label: "derived key", sub: "PBKDF2-HMAC-SHA256" },
      async compute({ pass, salt, iter, bytes }) {
        if (!pass || !salt) throw new Error("enter a password and salt");
        if (!Number.isInteger(iter) || iter < 1 || iter > 1000000) throw new Error("iterations: 1 – 1,000,000");
        if (!Number.isInteger(bytes) || bytes < 1 || bytes > 256) throw new Error("key bytes: 1 – 256");
        return HashCalc.toHex(await HashCalc.pbkdf2(pass, salt, iter, bytes, "SHA-256"));
      }
    }],
    "09-wpa-psk.md": ["calc9", {
      title: "WPA/WPA2 passphrase → PSK",
      fields: [
        { id: "pass", label: "passphrase", value: "password", placeholder: "8–63 characters…" },
        { id: "ssid", label: "SSID", value: "IEEE" }
      ],
      output: { label: "raw PSK", sub: "PBKDF2-HMAC-SHA1 · 4096 · 32B" },
      async compute({ pass, ssid }) {
        if (pass.length < 8 || pass.length > 63) throw new Error("WPA passphrases are 8–63 characters");
        const ssidBytes = new TextEncoder().encode(ssid).length;
        if (ssidBytes < 1 || ssidBytes > 32) throw new Error("an SSID is 1–32 bytes");
        return HashCalc.toHex(await HashCalc.pbkdf2(pass, ssid, 4096, 32, "SHA-1"));
      }
    }]
  };

  for (const [file, [id, config]] of Object.entries(CALCS)) {
    BookEngine.onChapter(file, () => HashCalc.mount(id, config));
  }
  for (const [file, [id, config]] of Object.entries(CUSTOM)) {
    BookEngine.onChapter(file, () => HashCalc.mountCustom(id, config));
  }
})();
