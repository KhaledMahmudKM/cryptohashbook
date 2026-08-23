# What a Hash Is

A cryptographic hash function takes an input of any size and produces a fixed-size output — a *digest* — such that the same input always gives the same digest, yet the digest reveals nothing practical about the input.

Think of it as a fingerprint for data. A single-character change to the input produces a completely different digest, an effect called the **avalanche property**. Try it in the calculator below: hash `hello`, then change it to `Hello` and watch the entire output change.

## The properties that matter

Four properties separate a cryptographic hash from an ordinary checksum:

- **Deterministic** — the same input always yields the same digest.
- **Preimage resistance** — given a digest, you can't feasibly find an input that produces it.
- **Second-preimage resistance** — given one input, you can't find a different input with the same digest.
- **Collision resistance** — you can't feasibly find *any* two inputs sharing a digest.

## What a hash is not

Hashing is not encryption: there is no key and no way to reverse it back to the input. It is not compression: you cannot reconstruct the original data from the digest. It is a one-way summary, useful precisely because it can't be undone.

> **Where hashes show up:** verifying a downloaded file wasn't corrupted, storing passwords without keeping the password itself, signing documents, addressing content in Git and blockchains, and de-duplicating data.

## Try it

The calculator below uses SHA-256, the modern default we'll meet properly in Chapter 4. For now, just watch how the output behaves as you type.

<div id="calc1"></div>
