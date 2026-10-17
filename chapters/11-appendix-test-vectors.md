# Appendix: Test Vectors

These are the known-answer tests the calculators were checked against. Each comes from the algorithm's standard or reference publication. Type the input into the matching chapter's calculator and compare the output character for character.

All inputs are plain ASCII text, exactly as shown between the quotes. Outputs are hexadecimal.

## Plain hashes

The input is the three-letter string `"abc"` unless noted otherwise. Every hash standard uses it as its first example.

| Algorithm | Input | Expected digest | Source |
|---|---|---|---|
| MD5 | `"abc"` | `900150983cd24fb0d6963f7d28e17f72` | RFC 1321 |
| SHA-1 | `"abc"` | `a9993e364706816aba3e25717850c26c9cd0d89d` | FIPS 180 |
| SHA-256 | `"abc"` | `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad` | FIPS 180 |
| SHA-256 | `""` (empty) | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | FIPS 180 |
| SHA-512 | `"abc"` | `ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f` | FIPS 180 |
| SHA3-256 | `"abc"` | `3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532` | FIPS 202 |
| SHA3-512 | `"abc"` | `b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0` | FIPS 202 |
| Keccak-256 | `""` (empty) | `c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470` | Keccak team |
| Keccak-256 | `"abc"` | `4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45` | Keccak team |
| RIPEMD-160 | `"abc"` | `8eb208f7e05d987a9b044a8e98c6b087f15a0bfc` | RIPEMD-160 paper |

Compare the SHA3-256 and Keccak-256 rows for `"abc"`: same input, same sponge, different padding, and therefore entirely different digests ([Chapter 5](05-sha3-and-keccak.md)).

## HMAC

Every row uses key `"Jefe"` and message `"what do ya want for nothing?"`. This is test case 2 in both RFC 2202 and RFC 4231. Try it in the [HMAC chapter](07-hmac.md).

| Algorithm | Expected tag | Source |
|---|---|---|
| HMAC-MD5 | `750c783e6ab0b503eaa86e310a5db738` | RFC 2202 |
| HMAC-SHA1 | `effcdf6ae5eb2fa2d27416d5f184df9c259a7c79` | RFC 2202 |
| HMAC-SHA256 | `5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843` | RFC 4231 |

## PBKDF2

Password `"password"`, salt `"salt"`. The [PBKDF2 calculator](08-pbkdf2.md) uses HMAC-SHA256.

| PRF | Iterations | Key bytes | Expected key |
|---|---|---|---|
| HMAC-SHA1 | 4096 | 20 | `4b007901b765489abead49d926f721d065a429c1` (RFC 6070) |
| HMAC-SHA256 | 1 | 32 | `120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b` |
| HMAC-SHA256 | 4096 | 32 | `c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a` |

The SHA1 row is the RFC's own vector and can't be entered here, since this book's calculator is fixed to SHA-256. The SHA-256 rows are widely published values for the same inputs.

## WPA/WPA2 PSK

PBKDF2-HMAC-SHA1, 4096 iterations, 32-byte output, from IEEE 802.11i Annex H. Try them in the [WPA chapter](09-wpa-psk.md).

| Passphrase | SSID | Expected PSK |
|---|---|---|
| `"password"` | `"IEEE"` | `f42c6fc52df0ebef9ebb4b90b38a5f902e83fe1b135a70e23aed762e9710a12e` |
| `"ThisIsAPassword"` | `"ThisIsASSID"` | `0dc0d6eb90555ed6419756b9a15ec3e3209b63df707dd508d14581f8982721af` |

> **If a value doesn't match**, check for a stray space or a different quote character first. A single changed byte changes the whole digest; that's the avalanche property from [Chapter 1](01-what-a-hash-is.md) at work.
