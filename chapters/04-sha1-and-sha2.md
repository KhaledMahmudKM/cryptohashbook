# The SHA-1 and SHA-2 Family

The SHA (Secure Hash Algorithm) family came from NIST. SHA-1 is now broken; SHA-2 is what most of the secure world runs on today.

## SHA-1

SHA-1 produces a 160-bit digest and, like MD5, uses the Merkle–Damgård design. In 2017 Google and CWI demonstrated a real SHA-1 collision (the "SHAttered" attack), confirming it unsafe for anything requiring collision resistance.

## SHA-2

SHA-2 is a family: SHA-256, SHA-384, and SHA-512 are the common members, named for their digest sizes. They remain unbroken and underpin TLS certificates, Git's newer modes, software signing, and much more. When someone says "use a secure hash" today, they usually mean SHA-256 or SHA-3.

> **Native in the browser.** The SHA family is part of the Web Crypto API (`crypto.subtle.digest`), so the calculators below run on the browser's own vetted implementation — no external library involved.

## Try it — with HMAC

Compare SHA-1 against the SHA-2 sizes, and see the keyed HMAC forms alongside.

<div id="calc4"></div>
