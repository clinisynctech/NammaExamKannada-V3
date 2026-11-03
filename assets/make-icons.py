#!/usr/bin/env python3
"""
Builds every Namma Exam image from the real logo artwork.

Run from v3/web/:     python assets/make-icons.py
Needs:                Pillow, numpy, and assets/logo-source.png

Writes, next to index.html:
    icon-192.png            normal
    icon-512.png            normal
    icon-maskable-192.png   artwork inside the middle 80%
    icon-maskable-512.png   artwork inside the middle 80%
    icon-badge.png          white on transparent, for notifications
    favicon.svg
    logo.png                1024px, full lock-up
    og-image.png            1200x630, for WhatsApp and search previews

WHY IT CROPS THE LOGO INSTEAD OF REDRAWING THE TEXT

    The Kannada word ಕನ್ನಡ contains a conjunct — ನ + virama + ನ — which only
    forms correctly with a complex-script shaper. Pillow on this machine has
    no libraqm, so drawing that string produced "ಕನೆನಡ": the virama rendered
    as its own vowel sign. Wrong word, on every icon.

    Cropping the bands out of the supplied artwork sidesteps shaping entirely
    and is more faithful anyway — it is literally your logo, at the exact
    proportions you drew it, rather than an approximation of it.

THE LOGO IS NOT SHOWN IN FULL AT EVERY SIZE — ON PURPOSE

    512 and above   ಕನ್ನಡ  +  NE  +  Powered by Clinisync Technology
    192             ಕನ್ನಡ  +  NE
    96 and below    NE only

    At 192px that tagline is about four pixels tall: a grey smudge that makes
    the icon look dirty rather than branded. The v2 project notes reached the
    same conclusion, that the line "belongs on a splash screen or app listing
    instead". So it appears where it can be read and nowhere else.

TWO RULES THE SIZES MUST OBEY

    Maskable icons are FULL BLEED with the artwork inside the central 80%.
    Android crops to a circle, squircle or rounded square depending on the
    launcher. v2 declared the SAME file for "any" and "maskable", which is
    worse than omitting maskable: the launcher trusts the declaration and
    crops into full-bleed artwork, cutting the logo's edges off.

    The notification badge is MONOCHROME. Android reduces it to a white
    silhouette, so anything coloured arrives as a grey blob.
"""

from PIL import Image
from pathlib import Path
import numpy as np
import sys

HERE = Path(__file__).resolve().parent
OUT = HERE.parent                       # v3/web/
SOURCE = HERE / "logo-source.png"

# Bands measured from the artwork, in source pixels (1254 x 1254).
# left, top, right, bottom — right/bottom exclusive, as PIL expects.
BAND_KN  = (379, 150,  870,  381)       # ಕನ್ನಡ
BAND_NE  = (249, 430, 1009,  845)       # NE
BAND_TAG = (185, 900, 1071,  956)       # Powered by Clinisync Technology

GAP_KN_NE  = 50 / 1254                  # gaps as a fraction of the artwork,
GAP_NE_TAG = 56 / 1254                  # so spacing scales with everything else


def navy(src):
    """The exact background of the supplied artwork, not a guess at it."""
    return tuple(src.convert("RGB").getpixel((3, 3)))


def compose(src, canvas, detail, fill, scale):
    """
    Stacks the wanted bands at their original relative sizes and centres the
    block. Keeping one scale factor for every band is what preserves the
    proportions you drew.
    """
    bands = {"full": [BAND_KN, BAND_NE, BAND_TAG],
             "mid":  [BAND_KN, BAND_NE],
             "mark": [BAND_NE]}[detail]
    gaps = {"full": [GAP_KN_NE, GAP_NE_TAG],
            "mid":  [GAP_KN_NE],
            "mark": []}[detail]

    crops = [src.crop(b) for b in bands]
    widest = max(c.width for c in crops)
    total_h = sum(c.height for c in crops) + sum(g * src.width for g in gaps)

    # one factor, chosen so neither dimension overflows the safe area
    k = min(canvas * scale / widest, canvas * scale / total_h)

    img = Image.new("RGBA", (canvas, canvas), fill)
    y = (canvas - total_h * k) / 2
    for i, c in enumerate(crops):
        w, h = max(1, round(c.width * k)), max(1, round(c.height * k))
        img.alpha_composite(c.convert("RGBA").resize((w, h), Image.LANCZOS),
                            (round((canvas - w) / 2), round(y)))
        y += h + (gaps[i] * src.width * k if i < len(gaps) else 0)
    return img


def rounded(img, radius_frac=0.22):
    """Rounds the corners by punching the alpha channel."""
    size = img.width
    mask = Image.new("L", (size, size), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1],
                                           radius=int(size * radius_frac), fill=255)
    out = img.copy()
    out.putalpha(mask)
    return out


def monochrome(img):
    """White silhouette on transparent, for the notification badge."""
    a = np.asarray(img.convert("L"))
    alpha = np.where(a > 110, 255, 0).astype(np.uint8)
    out = np.zeros((*a.shape, 4), dtype=np.uint8)
    out[..., :3] = 255
    out[..., 3] = alpha
    return Image.fromarray(out, "RGBA")


FAVICON = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0d2b4e"/>
  <text x="32" y="44" text-anchor="middle" font-family="Arial,Helvetica,sans-serif"
        font-weight="700" font-size="30" fill="#ffffff">NE</text>
</svg>
'''


def main():
    if not SOURCE.exists():
        print(f"  ! {SOURCE} is missing — put the logo artwork there first.")
        return 1

    src = Image.open(SOURCE).convert("RGB")
    bg = navy(src) + (255,)
    made = []

    for size in (192, 512):
        detail = "full" if size >= 512 else "mid"
        p = OUT / f"icon-{size}.png"
        rounded(compose(src, size, detail, bg, 0.80)).save(p); made.append(p)
        # Maskable: edge to edge, nothing rounded — the launcher supplies the
        # shape, and rounded corners here become transparent notches.
        #
        # 0.58, not the 0.80 the "80% safe zone" suggests. That 80% is a
        # CIRCLE, and this lock-up is wide: at 0.62 the ends of the tagline
        # sat 6px outside it and would have been shaved off on round
        # launchers. Measured, not guessed — see the check at the bottom.
        p = OUT / f"icon-maskable-{size}.png"
        compose(src, size, detail, bg, 0.58).save(p); made.append(p)

    p = OUT / "icon-badge.png"
    monochrome(compose(src, 96, "mark", (0, 0, 0, 255), 0.82)).save(p); made.append(p)

    p = OUT / "logo.png"
    compose(src, 1024, "full", bg, 0.84).save(p); made.append(p)

    # share card: built square then centred on the wide canvas
    card = Image.new("RGBA", (1200, 630), bg)
    card.alpha_composite(compose(src, 630, "full", (0, 0, 0, 0), 0.74), (285, 0))
    p = OUT / "og-image.png"; card.save(p); made.append(p)

    p = OUT / "favicon.svg"; p.write_text(FAVICON, encoding="utf-8"); made.append(p)

    for f in made:
        print(f"  {f.name:24} {f.stat().st_size:>8,} bytes")
    print(f"\n  {len(made)} files written to {OUT}")

    # --- the check that matters: nothing may sit outside the circle a
    # --- launcher crops a maskable icon to
    rgb = np.array(bg[:3])
    ok = True
    for size in (192, 512):
        a = np.asarray(Image.open(OUT / f"icon-maskable-{size}.png").convert("RGB")).astype(int)
        n = a.shape[0]
        ink = np.abs(a - rgb).sum(axis=2) > 40
        yy, xx = np.mgrid[0:n, 0:n]
        c = (n - 1) / 2
        r = np.sqrt((xx - c) ** 2 + (yy - c) ** 2)
        limit = n * 0.40
        bad = int((ink & (r > limit)).sum())
        print(f"  maskable {size}: {bad} px outside the safe circle "
              f"(furthest ink {r[ink].max():.0f} of {limit:.0f})")
        ok = ok and bad == 0
    print("  " + ("safe zone OK" if ok else "!! artwork would be cropped — lower the maskable scale"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
