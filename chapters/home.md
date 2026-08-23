# A Concise Book on Cryptographic Hashes

Cryptographic hash functions are quietly everywhere — behind every secure download, password check, digital signature, and blockchain address. This short book explains the ones you'll actually meet, and lets you compute them yourself right on the page.

## What this book covers

We start with what a hash is and the properties that make it trustworthy, then walk through the important algorithms one by one — MD5, the SHA family, SHA-3 and Keccak, and RIPEMD-160 — being honest about which are broken and which are still sound. From there we build up to keyed hashing (HMAC), password-based key derivation (PBKDF2), and a real-world protocol that ties it all together: WPA/WPA2 Wi-Fi keys.

## Learn by doing

Every chapter embeds a **live calculator**. Type a message and watch the digest appear and change as you edit — the fastest way to build intuition for how these functions behave. Nothing you type is ever uploaded; all computation happens locally in your browser using its built-in cryptography (plus a couple of small open-source libraries for the algorithms browsers don't provide natively).

> **Who this is for.** Developers, students, and the curious. You don't need a maths background — the focus is practical understanding, not proofs. Some familiarity with the idea of encoding text (hex, bytes) helps but isn't required.

## How to read it

The chapters build on each other, so first-time readers will get the most from reading in order. If you're here for one specific algorithm, jump straight to its chapter from the sidebar — each stands on its own too.
