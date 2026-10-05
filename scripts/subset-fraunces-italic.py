# Builds the two small Fraunces italic files that paint the site's italic text at first
# paint, in place of the 150 KB full italic (wght + opsz + SOFT + WONK, latin).
#
#   src/assets/fonts/fraunces-swash-italic.woff2   family "Fraunces Swash": SOFT 100 and
#       WONK 1 pinned, wght 300 to 360, opsz kept. Every SOFT 100 italic on the site
#       (.swash, the marquee words, the maker and about pull quotes, the process numerals)
#       sets weight 330 or 340, so this is the whole swash voice.
#   src/assets/fonts/fraunces-italic-basic.woff2   family "Fraunces Variable" (italic):
#       the plain italic at its default SOFT 0 / WONK 1, wght and opsz kept.
#
# Both are cut to the characters below; any other character in italic text falls through
# to the @fontsource full italic (unicode-range ordering in globals.css), so nothing ever
# renders in a fallback face. Re-run after a @fontsource-variable/fraunces upgrade:
#
#   python scripts/subset-fraunces-italic.py
#
# Needs fontTools (pip install fonttools brotli). 2026-10-04, optimize pass.
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2"
OUT = ROOT / "src/assets/fonts"

# Keep in step with the unicode-range on both @font-face rules in globals.css.
UNICODES = (
    list(range(0x20, 0x7F))
    + [0xA0, 0xB7, 0xE9, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026]
)


def cut() -> TTFont:
    font = TTFont(SRC)
    opts = subset.Options()
    opts.layout_features = ["*"]
    opts.flavor = None
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    return font


def save(font: TTFont, name: str) -> None:
    font.flavor = "woff2"
    path = OUT / name
    font.save(path)
    print(f"{path.relative_to(ROOT)}: {path.stat().st_size} bytes")


OUT.mkdir(parents=True, exist_ok=True)
save(
    instancer.instantiateVariableFont(cut(), {"SOFT": 100, "WONK": 1, "wght": (300, 360)}),
    "fraunces-swash-italic.woff2",
)
save(instancer.instantiateVariableFont(cut(), {"SOFT": 0, "WONK": 1}), "fraunces-italic-basic.woff2")
