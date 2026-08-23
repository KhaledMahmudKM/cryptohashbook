# A Real Case: WPA/WPA2 PSK

Everything so far composes into real protocols. Wi-Fi's WPA/WPA2 Personal mode is a compact example built entirely from pieces you've now met.

## The construction

WPA/WPA2 turns your Wi-Fi passphrase into a 256-bit Pre-Shared Key (PSK) using **PBKDF2-HMAC-SHA1** with fixed parameters defined by IEEE 802.11i:

- the **passphrase** is the password,
- the network **SSID** is the salt,
- **4096 iterations**, and
- a **256-bit** (32-byte) output.

So the PSK is simply `PBKDF2(passphrase, SSID, 4096, 32)` over HMAC-SHA1. This is exactly what tools like Wireshark's PSK generator compute.

> **Why the SSID as salt?** Two networks with the same passphrase but different names produce different keys, so precomputed tables would have to target each network name individually.

## Try it

Enter a passphrase and SSID to compute the raw PSK. The iteration count and key size are fixed by the standard.

<div class="hc" id="wpabox">
  <div class="hc-title">WPA/WPA2 passphrase → PSK</div>
  <div class="hc-field"><label for="wp-pass">passphrase</label>
    <input class="hc-input" id="wp-pass" placeholder="8–63 characters…" value="password" autocomplete="off"></div>
  <div class="hc-field"><label for="wp-ssid">SSID</label>
    <input class="hc-input" id="wp-ssid" value="IEEE" autocomplete="off"></div>
  <div class="hc-rows"><div class="hc-row">
    <div class="hc-name">raw PSK<small>PBKDF2-HMAC-SHA1 · 4096 · 32B</small></div>
    <div class="hc-out" id="wp-out"></div>
    <button class="hc-copy" data-for="wp-out" title="Copy">⧉</button>
  </div></div>
</div>
