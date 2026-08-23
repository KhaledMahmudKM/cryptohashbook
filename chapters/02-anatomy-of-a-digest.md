# Anatomy of a Digest

A digest is just a string of bytes. How we display those bytes, and how many of them there are, shapes everything about a hash's strength and its use.

## Hex and base64

The same digest can be shown different ways. **Hexadecimal** gives two characters per byte, so a 256-bit (32-byte) digest is 64 hex characters. **Base64** packs the same bytes more densely using 64 symbols. They encode identical bytes — only the presentation differs. Toggle the output below to see it.

## Output size and "bits of security"

Digest length is usually quoted in bits: MD5 is 128, SHA-1 and RIPEMD-160 are 160, SHA-256 is 256. More bits mean a larger space of possible digests, and that governs how hard collisions are to find.

> **The birthday bound.** Because of the birthday paradox, finding a collision takes roughly `2^(n/2)` work for an `n`-bit hash, not `2^n`. So SHA-256 gives about 128 bits of *collision* resistance — still far beyond reach, but half the exponent you might expect.

## Try it

Hash the same text three ways and compare lengths. Flip between hex and base64 to confirm the bytes are the same underneath.

<div id="calc2"></div>
