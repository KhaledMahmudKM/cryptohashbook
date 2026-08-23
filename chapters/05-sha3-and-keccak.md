# SHA-3 and Keccak

SHA-3, standardized in 2015, is not a patch on SHA-2 — it's a fundamentally different design chosen through an open competition.

## The sponge construction

Where MD5/SHA-1/SHA-2 use Merkle–Damgård, SHA-3 is built on a **sponge**: input is "absorbed" into a large internal state, then output is "squeezed" out. This structure sidesteps some length-extension weaknesses that affect the older family.

## SHA-3 versus Keccak

SHA-3 is based on the Keccak submission that won the competition. During standardization NIST changed one thing — the padding rule — so **SHA-3 and the original Keccak produce different digests for the same input.** The calculator makes this visible: SHA3-256 and Keccak-256 of the same text don't match.

> **Why it matters:** Ethereum adopted Keccak-256 (the pre-standardization padding) before SHA-3 was finalized, so blockchain code uses Keccak, while most other systems use official SHA-3. Mixing them up is a classic bug.

## Try it

These use the [js-sha3](https://github.com/emn178/js-sha3) library, loaded from a CDN, since the Web Crypto API doesn't offer SHA-3. Compare the two paddings.

<div id="calc5"></div>
