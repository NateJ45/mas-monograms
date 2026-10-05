# Builds the installable font files for Mary Ann's brand kit (Phase F of
# docs/superpowers/specs/2026-10-05-studio-direction.md, 2026-10-05).
#
# The site loads its fonts as web-only WOFF2 files from @fontsource, which a
# Windows PC or a Mac cannot install. This script turns them into plain static
# TrueType files (.ttf) that install with a double-click, work in Word and can
# be uploaded to Canva, and writes them to scripts/assets/brand-kit-fonts/ (the
# output is committed; scripts/generate-brand-kit.mjs copies it into
# public/brand-kit/fonts/ and the ZIP).
#
#   Fraunces-Regular.ttf    Fraunces, weight 400, 72pt optical size, SOFT 0
#   Fraunces-SemiBold.ttf   Fraunces, weight 600
#   Fraunces-Italic.ttf     Fraunces italic, weight 340, SOFT 100, WONK 1 (the site's "swash")
#   Mulish-Regular.ttf      Mulish, weight 400
#   Mulish-Bold.ttf         Mulish, weight 700
#   Mulish-Italic.ttf       Mulish italic, weight 400
#   Petemoss-Regular.ttf    Petemoss (a static font already; only the format changes)
#
# LICENCE (checked 2026-10-05 in each package's LICENSE): all three families are
# under the SIL Open Font License 1.1 and none declares a Reserved Font Name, so
# a modified version (an instance, a format change) may keep its name and may be
# redistributed, bundled with other software, as long as the full licence text and
# the copyright line go with it and the fonts are not sold on their own. The
# generator copies each LICENSE verbatim beside the files.
#
# Character coverage: the @fontsource "latin" files (Basic Latin, Latin-1, the
# common punctuation), which covers English and most Western European names. For
# every language, the full families are free at fonts.google.com.
#
#   python scripts/build-brand-kit-fonts.py      (needs: pip install fonttools brotli)
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
NM = ROOT / "node_modules"
OUT = ROOT / "scripts/assets/brand-kit-fonts"

FRAUNCES = NM / "@fontsource-variable/fraunces/files"
MULISH = NM / "@fontsource-variable/mulish/files"
PETEMOSS = NM / "@fontsource/petemoss/files"


def set_names(font: TTFont, family: str, style: str) -> None:
    """Plain family/style names so Word and Canva list it as e.g. 'Fraunces' + 'Italic'."""
    name = font["name"]
    full = f"{family} {style}" if style != "Regular" else family
    ps = f"{family}-{style}".replace(" ", "")
    # Drop the variable-font and typographic names left over from the source.
    keep = {0, 7, 8, 9, 11, 12, 13, 14}
    name.names = [n for n in name.names if n.nameID in keep]
    ribbi = style if style in ("Regular", "Bold", "Italic", "Bold Italic") else None
    fam1 = family if ribbi else f"{family} {style}"
    sub2 = ribbi or "Regular"
    for nid, val in (
        (1, fam1),
        (2, sub2),
        (3, f"{ps};MAS Monograms brand kit"),
        (4, full),
        (5, "Version 1.000"),
        (6, ps),
        (16, family),
        (17, style),
    ):
        name.setName(val, nid, 3, 1, 0x409)
    # Weight and style bits that Word reads.
    os2 = font["OS/2"]
    italic = "Italic" in style
    bold = style.startswith("Bold")
    sel = 0
    if italic:
        sel |= 1
    if bold:
        sel |= 1 << 5
    if not italic and not bold:
        sel |= 1 << 6
    os2.fsSelection = (os2.fsSelection & ~0b1100001) | sel
    # A style-linked face reports the weight Word expects for its slot (the
    # Fraunces italic is drawn at 340 but sits in the "Italic" slot of Regular).
    if ribbi:
        os2.usWeightClass = 700 if bold else 400
    head = font["head"]
    head.macStyle = (1 if bold else 0) | (2 if italic else 0)
    if "post" in font:
        font["post"].italicAngle = font["post"].italicAngle if italic else 0


def instance(src: Path, axes: dict, family: str, style: str, out: str) -> None:
    font = TTFont(src)
    if "fvar" in font:
        font = instancer.instantiateVariableFont(font, axes)
    font.flavor = None
    # Keep the source's timestamp so a re-run writes byte-identical files.
    font.recalcTimestamp = False
    set_names(font, family, style)
    font.save(OUT / out)
    print(f"wrote {out} ({(OUT / out).stat().st_size // 1024} KB)")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    fr = FRAUNCES / "fraunces-latin-full-normal.woff2"
    fri = FRAUNCES / "fraunces-latin-full-italic.woff2"
    instance(fr, {"wght": 400, "opsz": 72, "SOFT": 0, "WONK": 0}, "Fraunces", "Regular", "Fraunces-Regular.ttf")
    instance(fr, {"wght": 600, "opsz": 72, "SOFT": 0, "WONK": 0}, "Fraunces", "SemiBold", "Fraunces-SemiBold.ttf")
    instance(fri, {"wght": 340, "opsz": 72, "SOFT": 100, "WONK": 1}, "Fraunces", "Italic", "Fraunces-Italic.ttf")
    mu = MULISH / "mulish-latin-wght-normal.woff2"
    mui = MULISH / "mulish-latin-wght-italic.woff2"
    instance(mu, {"wght": 400}, "Mulish", "Regular", "Mulish-Regular.ttf")
    instance(mu, {"wght": 700}, "Mulish", "Bold", "Mulish-Bold.ttf")
    instance(mui, {"wght": 400}, "Mulish", "Italic", "Mulish-Italic.ttf")
    instance(PETEMOSS / "petemoss-latin-400-normal.woff2", {}, "Petemoss", "Regular", "Petemoss-Regular.ttf")


if __name__ == "__main__":
    main()
