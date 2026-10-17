# Password Hashing: PBKDF2

Passwords need more than a plain hash. PBKDF2 turns a password into a key deliberately *slowly*, to blunt guessing attacks.

## Why raw hashes are wrong for passwords

A fast hash like SHA-256 is a liability for passwords: an attacker can try billions of guesses per second, and identical passwords produce identical digests. We want the opposite — slow, and unique per user.

## Salt and iterations

A **salt** is a unique random value mixed with each password, so identical passwords hash differently and precomputed tables (rainbow tables) don't help. **Iterations** repeat the internal hashing thousands of times, multiplying the attacker's cost. PBKDF2 also lets you request a key of any length, which is why it doubles as a key-derivation function.

> **Newer options.** PBKDF2 is still standard and FIPS-approved, but bcrypt, scrypt, and especially **Argon2** add memory-hardness that resists GPU and ASIC attacks better. Prefer Argon2 for new password systems; PBKDF2 remains fine where compliance or availability demands it.

## Try it

This calculator derives a key with PBKDF2-HMAC-SHA256. Change the salt or iteration count and watch the derived key change. (It runs on the Web Crypto API.)

<div id="calc8"></div>
