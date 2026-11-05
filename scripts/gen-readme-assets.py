#!/usr/bin/env python3
"""Generate README image assets for dsh-composer-history (docs/assets/).

Outputs (idempotent overwrite):
  dsh-composer-history-flow-light.svg / dsh-composer-history-flow-dark.svg
      Hero flow diagram. Two hand-written SVG files (vector — never rasterized
      to webp). Text inside is command-surface tokens only (ArrowUp, Ctrl+R,
      /save, dsh.composer-history.v1, ...), so all five README languages share
      the same pair.

This plugin has no real GUI screenshot to ship (the composer belongs to the
host, and the repo's terminal-card PNG is an illustration, not a UI capture),
so — per the README playbook — the hero degrades to a flow diagram instead of
a fabricated interface mockup. There is no benchmark data in this repo, so no
evidence chart is generated either.

Run once:  python scripts/gen-readme-assets.py
Requires:  Pillow (only for the CJK font probe; the SVGs are pure text)
"""
from __future__ import annotations

import os
import sys

from PIL import ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "assets")

NAME = "dsh-composer-history"

# --- palette: PerryLink family (accent) + GitHub page backgrounds ----------
FAMILY = "#4B67B4"   # family accent (badges labelColor family uses #2B3245)
GREEN = {"light": "#16a34a", "dark": "#3fb950"}
SKIN = {
    "light": dict(bg="#ffffff", box="#f6f8fa", border="#d0d7de",
                  text="#1f2328", sub="#57606a"),
    "dark": dict(bg="#0d1117", box="#161b22", border="#30363d",
                 text="#f0f6fc", sub="#8b949e"),
}

# --- CJK font probe: the family palette must never fall back to tofu --------
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyh.ttc",      # Microsoft YaHei
    r"C:\Windows\Fonts\simhei.ttf",    # SimHei
    r"C:\Windows\Fonts\Deng.ttf",      # DengXian
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/System/Library/Fonts/PingFang.ttc",
]
FONT_PATH = next((p for p in FONT_CANDIDATES if os.path.exists(p)), None)
if FONT_PATH is None:
    sys.exit("FATAL: no CJK font found (looked for msyh.ttc, simhei.ttf, "
             "Deng.ttf, Noto Sans CJK, PingFang). Same palette across the "
             "family, so refuse to render without a font; install one of the "
             "probed fonts and re-run.")


def probe_font() -> None:
    """Load the CJK font once so a broken font file fails here, not later."""
    font = ImageFont.truetype(FONT_PATH, 16)
    if font.getlength("编排") <= 0:
        sys.exit(f"FATAL: CJK font {FONT_PATH} cannot measure glyphs")


# ---------------------------------------------------------------------------
# Hero flow SVG (light + dark): the two paths through the composer
# ---------------------------------------------------------------------------
ROWS = [
    ("recall", [
        ("keydown", "plain phase"),
        ("interceptor", "edge check"),
        ("setDraft", "{draft, caret}"),
        ("localStorage", "dsh.composer-history.v1"),
        ("Enter", "→ model"),
    ]),
    ("search", [
        ("Ctrl+R", "search overlay"),
        ("snippets.v1", "/save · /load"),
        ("templates.v1", "{{workspace}} …"),
        ("insights.v1", "insightMinUses 2"),
        ("[compacted] …", "includeCompactionSummaries"),
    ]),
]


def flow_svg(skin: str) -> str:
    s = SKIN[skin]
    w, h = 1200, 500
    nw, nh, gap = 180, 96, 45
    row_y = (170, 322)
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
        f'viewBox="0 0 {w} {h}" role="img" '
        f'aria-label="dsh-composer-history flow">',
        f'<title>dsh-composer-history flow</title>',
        f'<rect width="{w}" height="{h}" rx="18" fill="{s["bg"]}"/>',
        f'<text x="60" y="60" fill="{s["text"]}" font-family="ui-sans-serif,'
        f'system-ui,sans-serif" font-size="30" font-weight="700">{NAME}</text>',
        f'<text x="60" y="92" fill="{s["sub"]}" font-family="ui-monospace,'
        f'monospace" font-size="16">ArrowUp · Ctrl+R · /save · /load · '
        f'[compacted] · localStorage</text>',
        f'<line x1="60" y1="112" x2="1140" y2="112" stroke="{s["border"]}"/>',
    ]
    for r, (label, nodes) in enumerate(ROWS):
        y0 = row_y[r]
        parts.append(
            f'<text x="60" y="{y0 - 14}" fill="{s["sub"]}" '
            f'font-family="ui-monospace,monospace" font-size="13" '
            f'letter-spacing="1">{label}</text>')
        for i, (head, sub) in enumerate(nodes):
            x = 60 + i * (nw + gap)
            accent = s["border"]
            if i == 1 and r == 0:
                accent = FAMILY
            if i == 0 and r == 1:
                accent = FAMILY
            if i == len(nodes) - 1 and r == 0:
                accent = GREEN[skin]
            parts.append(
                f'<rect x="{x}" y="{y0}" width="{nw}" height="{nh}" rx="14" '
                f'fill="{s["box"]}" stroke="{accent}" stroke-width="2"/>')
            head_size = 14 if len(head) > 14 else 15
            sub_size = 11 if len(sub) > 20 else 12
            parts.append(
                f'<text x="{x + nw // 2}" y="{y0 + 40}" fill="{s["text"]}" '
                f'text-anchor="middle" font-family="ui-monospace,monospace" '
                f'font-size="{head_size}" font-weight="700">{head}</text>')
            parts.append(
                f'<text x="{x + nw // 2}" y="{y0 + 68}" fill="{s["sub"]}" '
                f'text-anchor="middle" font-family="ui-monospace,monospace" '
                f'font-size="{sub_size}">{sub}</text>')
            if i < len(nodes) - 1:
                ax = x + nw + 6
                ay = y0 + nh // 2
                parts.append(
                    f'<path d="M{ax} {ay}h{gap - 12}" stroke="{s["sub"]}" '
                    f'stroke-width="3"/>')
                parts.append(
                    f'<path d="M{ax + gap - 14} {ay - 7}l10 7-10 7" fill="none" '
                    f'stroke="{s["sub"]}" stroke-width="3" '
                    f'stroke-linecap="round" stroke-linejoin="round"/>')
    parts.append(
        f'<line x1="60" y1="446" x2="1140" y2="446" stroke="{s["border"]}" '
        f'stroke-dasharray="5 5"/>')
    parts.append(
        f'<text x="60" y="478" fill="{s["sub"]}" font-family="ui-monospace,'
        f'monospace" font-size="13">network: none · schemaVersion: 1 · '
        f'Export JSON / Import file · browser-local only</text>')
    parts.append('</svg>')
    return "\n".join(parts) + "\n"


def main() -> None:
    probe_font()
    os.makedirs(OUT, exist_ok=True)
    for skin in ("light", "dark"):
        path = os.path.join(OUT, f"{NAME}-flow-{skin}.svg")
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(flow_svg(skin))
    print("wrote 2 SVG assets to docs/assets/")


if __name__ == "__main__":
    main()
