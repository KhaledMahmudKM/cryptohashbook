# Keyed Hashing: HMAC

A plain hash tells you data wasn't accidentally changed. An HMAC tells you it wasn't changed by anyone *without the key* — it authenticates, not just verifies.

## Why not just concatenate a key?

A tempting idea is `hash(key + message)`. With Merkle–Damgård hashes this is unsafe: the length-extension property lets an attacker append data and produce a valid digest without knowing the key. HMAC is the fix.

## How HMAC works

HMAC hashes the message twice with the key mixed in through two different padded constants (the inner and outer pads): `H((key ⊕ opad) ∥ H((key ⊕ ipad) ∥ message))`. This nested structure defeats length-extension and works over *any* underlying hash — HMAC-SHA256, HMAC-MD5, HMAC-RIPEMD160, and so on.

> **Same message, different keys → different tags.** Change the key below and every output changes. That key-dependence is the whole point.

## Try it

One message, one key, computed as HMAC over several different hashes so you can see the construction is hash-agnostic.

<div id="calc7"></div>
