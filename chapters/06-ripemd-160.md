# RIPEMD-160

RIPEMD-160, published in 1996 by European researchers, produces a 160-bit digest. Unlike MD5 and SHA-1, it has no known practical collision attack.

## Old but not obsolete

RIPEMD-160 was designed as a strengthened, independent alternative to the MD/SHA line. It's rarely chosen for new general-purpose designs — its 160-bit size gives only about 80 bits of collision resistance, below the modern comfort level — but it remains structurally intact.

## Its role in Bitcoin

RIPEMD-160 is very much alive in cryptocurrency. Bitcoin addresses are built with `RIPEMD160(SHA256(public key))`, a step called HASH160, chosen partly because the shorter output yields shorter addresses. Ethereum exposes it as a precompiled contract too.

> **The takeaway:** "old" and "broken" are not the same thing. RIPEMD-160 is dated but sound, and it processes enormous value daily.

## Try it — with HMAC

Plain RIPEMD-160 and its keyed HMAC form, via Jeremy Lin's library.

<div id="calc6"></div>
