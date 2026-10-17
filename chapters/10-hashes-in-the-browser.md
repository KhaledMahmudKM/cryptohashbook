# Computing Hashes in the Browser

Every calculator in this book runs entirely in your browser. Nothing you type is ever sent to a server. Here's how the pieces fit.

## Three sources of computation

- **Web Crypto API** (`crypto.subtle`) — the browser's built-in, vetted cryptography. It provides the SHA family, HMAC, and PBKDF2. We used it wherever possible.
- **Bundled JavaScript libraries** — MD5 (Paul Johnston) and RIPEMD-160 (Jeremy Lin), because the Web Crypto API deliberately omits them.
- **js-sha3** — loaded from a CDN for SHA-3 and Keccak, which the browser also doesn't provide.

## Why local matters

Hashing passphrases or sensitive text on a remote server means trusting that server. Doing it in the browser removes that trust requirement entirely — the computation happens on your machine, and you can verify it by disconnecting from the network and watching the calculators still work.

## A note on trust and test vectors

How do you know an implementation is correct? You check it against published **test vectors** — known input/output pairs from the standards. The [appendix](11-appendix-test-vectors.md) lists the ones these calculators were verified against, so you can confirm them yourself.

> **Build it yourself.** All the calculators run on one small JavaScript widget (`hashcalc.js`), and each chapter's calculator is a short declarative configuration in `book.js`. No framework, no build step.
