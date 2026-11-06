#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the README figure set for dsh-composer-history.

Outputs (docs/assets/, overwritten in place):

  dsh-composer-history-hero-{zh,en}-{light,dark}.webp   1440x576 hero banner
  dsh-composer-history-flow-v5-{light,dark}.svg         1100x660 structure figure

The two figures are derived from the plugin's real behavior, not a generic
pipeline. The hero draws the composer's recall memory (the merged history
stack fed by session / persisted / workspace / [compacted] entries), the
stashed {draft, caret} ticket and the Ctrl+R overlay. The structure figure is
a state machine: the DraftRecall machine's IDLE <-> BROWSING states, the
interception gate shared by both, the transition guards/effects, the
effect + storage write path and the parallel search lane.

The hero is raster (Pillow) and localized (zh for README.md, en for the other
four READMEs). The structure figure is hand-written SVG with token-only
English labels, so one light/dark pair serves all five languages.

Run:  python scripts/gen-readme-assets.py
Needs: Pillow and the Windows fonts msyh.ttc / msyhbd.ttc / consola.ttf.
"""

from __future__ import annotations

import math
import os
import sys
from xml.sax.saxutils import escape

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs", "assets")
NAME = "dsh-composer-history"

FONT_DIR = r"C:\Windows\Fonts"
F_REG = os.path.join(FONT_DIR, "msyh.ttc")
F_BOLD = os.path.join(FONT_DIR, "msyhbd.ttc")
F_MONO = os.path.join(FONT_DIR, "consola.ttf")
F_MONO_BOLD = os.path.join(FONT_DIR, "consolab.ttf")

for _path in (F_REG, F_BOLD, F_MONO):
    if not os.path.exists(_path):
        sys.exit(f"FATAL: missing font {_path}; this repo's palette uses "
                 f"msyh.ttc / msyhbd.ttc / consola.ttf")

_FONTS: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}


def F(path: str, size: int) -> ImageFont.FreeTypeFont:
    """Cached FreeType face."""
    key = (path, int(size))
    if key not in _FONTS:
        _FONTS[key] = ImageFont.truetype(path, int(size))
    return _FONTS[key]


def rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    return rgb(value) + (alpha,)


# ---------------------------------------------------------------------------
# shared skin
# ---------------------------------------------------------------------------
HERO_SKIN = {
    "light": dict(
        bg=("#f9f6fd", "#e4eaf8"), glow=("#4B67B4", 22),
        card="#ffffff", tint="#f7f9ff", stroke="#d6dded",
        text="#1b2233", body="#2b3347", sub="#5a6275", faint="#8a93a8",
        accent="#4B67B4", accent_soft="#eef1fa", dash="#8fa2d8",
        amber="#b45309", green="#15803d", purple="#6d28d9",
        shadow=(52, 72, 130, 30),
    ),
    "dark": dict(
        bg=("#131a2a", "#0c1016"), glow=("#4B67B4", 50),
        card="#1b2438", tint="#1e2a44", stroke="#2b3550",
        text="#eef2fb", body="#d7def0", sub="#9aa7c2", faint="#6f7c96",
        accent="#8496f5", accent_soft="#202b45", dash="#4d5f96",
        amber="#fbbf24", green="#4ade80", purple="#c4b5fd",
        shadow=(0, 0, 0, 120),
    ),
}

FLOW_SKIN = {
    "light": dict(
        bg=("#f9f6fd", "#e4eaf8"),
        card="#ffffff", stroke="#d6dded", rowbg="#f4f7fd",
        text="#1b2233", body="#2f3750", sub="#5a6275", faint="#8a93a8",
        accent="#4B67B4", accent_soft="#eef1fa", green="#15803d",
        amber="#b45309", dash="#8fa2d8",
        shadow="#2a3a6a", shadow_op="0.16",
    ),
    "dark": dict(
        bg=("#131a2a", "#0c1016"),
        card="#1b2438", stroke="#2b3550", rowbg="#202a41",
        text="#eef2fb", body="#d7def0", sub="#9aa7c2", faint="#6f7c96",
        accent="#8496f5", accent_soft="#202b45", green="#4ade80",
        amber="#fbbf24", dash="#4d5f96",
        shadow="#000000", shadow_op="0.55",
    ),
}

# ---------------------------------------------------------------------------
# hero copy (zh: README.md, en: the four translated READMEs)
# ---------------------------------------------------------------------------
HERO = {
    "zh": dict(
        kicker="DSH 插件 · 作曲器记忆层",
        title=[("按 ", "text"), ("↑", "accent"), (" 找回历史", "text")],
        value=["像终端一样按 ↑ 召回历史，", "打了一半的草稿一个字不丢。"],
        subtitle="边缘优先召回 · 本地持久化 · Ctrl+R 反向搜索",
        meta="纯 UI · 无网络 · 4 个 localStorage 键 · Apache-2.0",
        footer1="github.com/PerryLink/dsh-composer-history",
        footer2="社区插件 · Apache-2.0 · 与 DeepSeek 无关",
        stack_label="历史栈 · 每条已发送消息",
        entries=[("重排 README 徽章", "session"), ("跑一遍 pnpm test", "persisted"),
                 ("重排 §配置 表格", "workspace"), ("[compacted] 摘要", "compacted")],
        recall_label="↑ 召回（首行）· ↓/Esc 还原",
        composer_label="作曲器 · plain 阶段",
        draft="帮我把 §配置 的表格重排…",
        enter_chip="Enter 才到模型",
        search_title="Ctrl+R · 反向搜索",
        search_rows=[("history", "12 条", "sub"), ("snippets", "ship-check", "green"),
                     ("templates", "{{workspace}}", "purple"),
                     ("[compacted]", "摘要", "amber")],
        search_footer=["↑↓ 选择 · Enter 填入", "Esc 取消 · 匹配高亮"],
        stash_title="暂存 {draft, caret}",
        stash_lines=["draft: 帮我把 §配置 …", "caret: 18"],
        stash_footer="回到最新 / Esc → 原样还原",
        note="localStorage ×4 · 无网络 · schemaVersion 1",
    ),
    "en": dict(
        kicker="DSH PLUGIN · COMPOSER MEMORY",
        title=[("History ", "text"), ("recall", "accent")],
        value=["Press ↑ on the first line to recall,", "your half-typed draft survives intact."],
        subtitle="edge-first recall · local storage · Ctrl+R search",
        meta="pure UI · no network · 4 localStorage keys · Apache-2.0",
        footer1="github.com/PerryLink/dsh-composer-history",
        footer2="Community plugin · Apache-2.0 · not affiliated with DeepSeek",
        stack_label="HISTORY STACK · sent messages",
        entries=[("README badge rows", "session"), ("run pnpm test", "persisted"),
                 ("reflow config table", "workspace"),
                 ("[compacted] summary", "compacted")],
        recall_label="↑ recall on line 1 · ↓/Esc restore",
        composer_label="COMPOSER · plain phase",
        draft="reflow the §config table…",
        enter_chip="Enter sends",
        search_title="Ctrl+R · reverse search",
        search_rows=[("history", "12 entries", "sub"), ("snippets", "ship-check", "green"),
                     ("templates", "{{workspace}}", "purple"),
                     ("[compacted]", "summary", "amber")],
        search_footer=["↑↓ select · Enter fill", "Esc cancel · match highlight"],
        stash_title="STASH {draft, caret}",
        stash_lines=["draft: reflow the §config…", "caret: 18"],
        stash_footer="newest / Esc → restore exactly",
        note="localStorage ×4 · no network · schemaVersion 1",
    ),
}


# ---------------------------------------------------------------------------
# Pillow helpers
# ---------------------------------------------------------------------------
def gradient(w: int, h: int, top: str, bottom: str) -> Image.Image:
    """Vertical brand gradient."""
    img = Image.new("RGBA", (w, h))
    draw = ImageDraw.Draw(img)
    c0, c1 = rgb(top), rgb(bottom)
    for y in range(h):
        t = y / (h - 1)
        draw.line([(0, y), (w, y)],
                  fill=tuple(int(c0[i] + (c1[i] - c0[i]) * t) for i in range(3)) + (255,))
    return img


def glow(img: Image.Image, cx: int, cy: int, rx: int, ry: int,
         color: str, alpha: int, blur: int) -> Image.Image:
    """Soft accent bloom used to keep the flat gradient from looking dead."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse((cx - rx, cy - ry, cx + rx, cy + ry),
                                  fill=rgba(color, alpha))
    return Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(blur)))


def paint_shadows(img: Image.Image, specs, color, blur: int = 16, dy: int = 9) -> Image.Image:
    """Composite every card shadow in one blurred pass."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for box, radius in specs:
        draw.rounded_rectangle((box[0], box[1] + dy, box[2], box[3] + dy),
                               radius=radius, fill=color)
    return Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(blur)))


def card(draw: ImageDraw.ImageDraw, box, radius: int, fill, stroke=None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=stroke, width=width)


def dashed_round_rect(draw: ImageDraw.ImageDraw, box, radius: int, color,
                      width: int = 2, dash: int = 7, gap: int = 6) -> None:
    """Dashed rounded border (Pillow has no dash pattern)."""
    x0, y0, x1, y1 = box
    r = radius
    pts: list[tuple[float, float]] = []

    def arc(cx: float, cy: float, start: float, end: float) -> None:
        steps = max(6, int(abs(end - start) / 3))
        for i in range(steps + 1):
            a = math.radians(start + (end - start) * i / steps)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))

    pts.extend((x0 + r + i, y0) for i in range(0, max(1, int(x1 - x0 - 2 * r)), 2))
    arc(x1 - r, y0 + r, -90, 0)
    pts.extend((x1, y0 + r + i) for i in range(0, max(1, int(y1 - y0 - 2 * r)), 2))
    arc(x1 - r, y1 - r, 0, 90)
    pts.extend((x1 - r - i, y1) for i in range(0, max(1, int(x1 - x0 - 2 * r)), 2))
    arc(x0 + r, y1 - r, 90, 180)
    pts.extend((x0, y1 - r - i) for i in range(0, max(1, int(y1 - y0 - 2 * r)), 2))
    arc(x0 + r, y0 + r, 180, 270)
    pts.append(pts[0])

    on, left = True, float(dash)
    prev = pts[0]
    for point in pts[1:]:
        seg = math.dist(prev, point)
        while seg > 0:
            step = min(seg, left)
            t = step / seg
            nxt = (prev[0] + (point[0] - prev[0]) * t, prev[1] + (point[1] - prev[1]) * t)
            if on:
                draw.line([prev, nxt], fill=color, width=width)
            prev = nxt
            seg -= step
            left -= step
            if left <= 1e-6:
                on = not on
                left = float(dash if on else gap)


def fit(path: str, text: str, size: int, maxw: float, minsize: int,
        label: str = "") -> ImageFont.FreeTypeFont:
    """Largest face size <= size that fits maxw (never below minsize)."""
    while size > minsize and F(path, size).getlength(text) > maxw:
        size -= 1
    face = F(path, size)
    if face.getlength(text) > maxw:
        print(f"WARN hero: {label or text[:18]!r} still {face.getlength(text):.0f}px "
              f"> {maxw:.0f}px at {minsize}px")
    return face


def put(draw: ImageDraw.ImageDraw, xy, text: str, face, fill, anchor: str = "ls") -> None:
    draw.text(xy, text, font=face, fill=fill, anchor=anchor)


def auto_face(text: str, size: int, *, mono: bool = False,
              bold: bool = False) -> ImageFont.FreeTypeFont:
    """Consolas has no CJK: fall back to YaHei as soon as the string is mixed."""
    ascii_only = all(ord(ch) < 128 for ch in text)
    if mono and ascii_only:
        return F(F_MONO_BOLD if bold else F_MONO, size)
    return F(F_BOLD if bold else F_REG, size)


def put_runs(draw: ImageDraw.ImageDraw, x: int, baseline: int, runs, face,
             palette: dict) -> int:
    """Draw colour-segmented text runs (the ↑ stays in the family accent)."""
    cursor = x
    for text, key in runs:
        put(draw, (cursor, baseline), text, face, palette[key])
        cursor += face.getlength(text)
    return cursor


# ---------------------------------------------------------------------------
# hero 1440x576
# ---------------------------------------------------------------------------
def hero(lang: str, theme: str) -> Image.Image:
    L, c = HERO[lang], HERO_SKIN[theme]
    w, h = 1440, 576
    img = gradient(w, h, c["bg"][0], c["bg"][1])
    img = glow(img, 1170, 220, 470, 330, c["glow"][0], c["glow"][1], 170)
    img = glow(img, 150, 520, 420, 240, c["glow"][0], max(6, c["glow"][1] // 2), 170)

    # geometry -------------------------------------------------------------
    sx, sw = 700, 340
    card_h, gap = 54, 10
    stack = [(sx, 80 + i * (card_h + gap), sx + sw, 80 + i * (card_h + gap) + card_h)
             for i in range(4)]
    comp = (700, 376, 1040, 482)
    search = (1064, 80, 1372, 352)
    stash = (1064, 376, 1372, 500)

    img = paint_shadows(img, [(b, 16) for b in stack] +
                        [(comp, 18), (search, 20), (stash, 20)],
                        c["shadow"], blur=16, dy=9)
    d = ImageDraw.Draw(img)

    # left column ----------------------------------------------------------
    kicker_face = F(F_BOLD, 17)
    kx, ky = 72, 66
    kw = int(kicker_face.getlength(L["kicker"])) + 48
    card(d, (kx, ky, kx + kw, ky + 44), 22, rgba(c["accent_soft"], 235), c["stroke"], 1)
    d.ellipse((kx + 18, ky + 17, kx + 30, ky + 29), fill=c["accent"])
    put(d, (kx + 36, ky + 28), L["kicker"], kicker_face, c["body"])

    title_face = F(F_BOLD, 80)
    title_w = sum(title_face.getlength(t) for t, _ in L["title"])
    if title_w > 568:
        sys.exit(f"FATAL: {lang} title is {title_w:.0f}px wide, column is 568px")
    put_runs(d, 72, 202, L["title"], title_face, c)

    for i, line in enumerate(L["value"]):
        face = fit(F_REG, line, 30, 568, 26, f"{lang} value {i + 1}")
        put(d, (72, 258 + i * 42), line, face, c["body"])

    sub_face = fit(F_REG, L["subtitle"], 26, 568, 23, f"{lang} subtitle")
    put(d, (72, 354), L["subtitle"], sub_face, c["sub"])

    meta_face = fit(F_REG, L["meta"], 20, 568, 18, f"{lang} meta")
    put(d, (72, 398), L["meta"], meta_face, c["sub"])

    d.line((72, 436, 640, 436), fill=c["stroke"], width=1)

    foot1 = fit(F_MONO, L["footer1"], 17, 568, 15, f"{lang} footer link")
    put(d, (72, 474), L["footer1"], foot1, c["sub"])
    foot2 = fit(F_REG, L["footer2"], 15, 568, 13, f"{lang} footer note")
    put(d, (72, 500), L["footer2"], foot2, c["faint"])

    # right: history stack -------------------------------------------------
    put(d, (sx, 64), L["stack_label"], F(F_REG, 16), c["sub"])
    tag_colors = {"session": c["accent"], "persisted": c["sub"],
                  "workspace": c["sub"], "compacted": c["amber"]}
    for box, (text, source) in zip(stack, L["entries"]):
        card(d, box, 16, c["card"], c["stroke"], 1)
        cy = (box[1] + box[3]) // 2
        d.ellipse((box[0] + 20, cy - 6, box[0] + 32, cy + 6),
                  fill=tag_colors[source])
        tag_face = F(F_MONO, 15)
        tag = "compacted" if source == "compacted" else source
        tag_w = tag_face.getlength(tag)
        put(d, (box[2] - 16, box[1] + 33), tag, tag_face,
            tag_colors[source], anchor="rs")
        area = box[2] - 16 - tag_w - 14 - (box[0] + 40)
        face = fit(F_REG, text, 18, area, 15, f"{lang} entry {text[:10]}")
        put(d, (box[0] + 40, box[1] + 33), text, face, c["body"])

    # right: recall arrows between the stack and the composer --------------
    ax = 724
    d.line((ax, 336, ax, 368), fill=c["accent"], width=2)
    d.polygon([(ax, 326), (ax - 6, 338), (ax + 6, 338)], fill=c["accent"])
    d.polygon([(ax, 378), (ax - 6, 366), (ax + 6, 366)], fill=c["accent"])
    recall_face = fit(F_REG, L["recall_label"], 17, 330, 15, f"{lang} recall label")
    put(d, (744, 360), L["recall_label"], recall_face, c["sub"])

    # right: composer ------------------------------------------------------
    card(d, comp, 18, c["tint"], c["accent"], 2)
    put(d, (comp[0] + 22, comp[1] + 30), L["composer_label"], F(F_REG, 15), c["sub"])
    draft_face = fit(F_REG, L["draft"], 18, comp[2] - comp[0] - 60, 15, f"{lang} draft")
    put(d, (comp[0] + 22, comp[1] + 68), L["draft"], draft_face, c["body"])
    caret_x = comp[0] + 24 + draft_face.getlength(L["draft"])
    d.rectangle((caret_x, comp[1] + 50, caret_x + 2, comp[1] + 78), fill=c["accent"])

    chip_face = F(F_REG, 14)
    chip_w = int(chip_face.getlength(L["enter_chip"])) + 24
    chip = (comp[2] - 16 - chip_w, comp[1] + 14, comp[2] - 16, comp[1] + 40)
    card(d, chip, 12, rgba(c["accent_soft"], 240), None, 0)
    put(d, ((chip[0] + chip[2]) // 2, chip[1] + 18), L["enter_chip"],
        chip_face, c["accent"], anchor="ms")

    # right: search overlay ------------------------------------------------
    card(d, search, 20, c["card"], c["stroke"], 1)
    put(d, (search[0] + 22, search[1] + 38), L["search_title"],
        F(F_BOLD, 19), c["accent"])
    row_colors = {"sub": c["sub"], "green": c["green"],
                  "purple": c["purple"], "amber": c["amber"]}
    for i, (label, sample, key) in enumerate(L["search_rows"]):
        ry = search[1] + 68 + i * 36
        d.ellipse((search[0] + 24, ry - 6, search[0] + 34, ry + 4),
                  fill=row_colors[key])
        put(d, (search[0] + 44, ry), label, F(F_MONO, 16), c["body"])
        put(d, (search[2] - 22, ry), sample,
            auto_face(sample, 14, mono=True), row_colors[key], anchor="rs")
    for i, line in enumerate(L["search_footer"]):
        put(d, (search[0] + 22, search[1] + 212 + i * 22), line,
            F(F_REG, 14), c["sub"])

    # right: stash ticket --------------------------------------------------
    card(d, stash, 20, rgba(c["card"], 235), None, 0)
    dashed_round_rect(d, stash, 20, rgba(c["dash"], 210), 2, 8, 6)
    put(d, (stash[0] + 22, stash[1] + 34), L["stash_title"],
        auto_face(L["stash_title"], 16, mono=True, bold=True), c["accent"])
    for i, line in enumerate(L["stash_lines"]):
        put(d, (stash[0] + 22, stash[1] + 64 + i * 24), line,
            auto_face(line, 15, mono=True), c["body"])
    put(d, (stash[0] + 22, stash[1] + 112), L["stash_footer"], F(F_REG, 14), c["faint"])

    put(d, (sx, 516), L["note"], auto_face(L["note"], 15, mono=True), c["faint"])

    return img


# ---------------------------------------------------------------------------
# structure figure 1100x660 (hand-written SVG)
# ---------------------------------------------------------------------------
def flow_svg(theme: str) -> str:
    c = FLOW_SKIN[theme]
    p: list[str] = []
    add = p.append

    def t(x, y, s, size, fill, weight=400, anchor="start", mono=False,
          spacing=None) -> str:
        family = ("'Consolas','Cascadia Mono',monospace" if mono
                  else "'Microsoft YaHei','Segoe UI',sans-serif")
        attrs = [f'x="{x}"', f'y="{y}"', f'font-size="{size}"',
                 f'fill="{fill}"', f'font-family="{family}"']
        if weight != 400:
            attrs.append(f'font-weight="{weight}"')
        if anchor != "start":
            attrs.append(f'text-anchor="{anchor}"')
        if spacing is not None:
            attrs.append(f'letter-spacing="{spacing}"')
        return f'<text {" ".join(attrs)}>{escape(s)}</text>'

    def rect(x, y, w, h, r, fill, stroke=None, sw=1, dashed=False,
             shadow=False) -> str:
        attrs = [f'x="{x}"', f'y="{y}"', f'width="{w}"', f'height="{h}"',
                 f'rx="{r}"', f'fill="{fill}"']
        if stroke:
            attrs += [f'stroke="{stroke}"', f'stroke-width="{sw}"']
        if dashed:
            attrs.append('stroke-dasharray="7 6"')
        if shadow:
            attrs.append('filter="url(#soft)"')
        return f'<rect {" ".join(attrs)}/>'

    def chip(x, y, w, h, label, fill, stroke, color, size=14, mono=False,
             weight=400) -> str:
        out = [rect(x, y, w, h, 10, fill, stroke, 1)]
        out.append(t(x + w / 2, y + h / 2 + size * 0.36, label, size, color,
                     weight=weight, anchor="middle", mono=mono))
        return "".join(out)

    # shell -----------------------------------------------------------------
    add('<?xml version="1.0" encoding="UTF-8"?>')
    add(f'<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="660" '
        f'viewBox="0 0 1100 660" role="img" aria-labelledby="fig-title">')
    add('<title id="fig-title">dsh-composer-history — DraftRecall state machine</title>')
    add('<defs>')
    add(f'<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{c["bg"][0]}"/>'
        f'<stop offset="1" stop-color="{c["bg"][1]}"/></linearGradient>')
    add(f'<filter id="soft" x="-25%" y="-25%" width="150%" height="150%">'
        f'<feDropShadow dx="0" dy="6" stdDeviation="10" '
        f'flood-color="{c["shadow"]}" flood-opacity="{c["shadow_op"]}"/></filter>')
    for key, color in (("acc", c["accent"]), ("grn", c["green"]),
                       ("sub", c["sub"]), ("fnt", c["faint"])):
        add(f'<marker id="arr-{key}" viewBox="0 0 10 10" refX="9" refY="5" '
            f'markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path d="M0 0L10 5L0 10Z" fill="{color}"/></marker>')
    add('</defs>')

    add(f'<rect width="1100" height="660" fill="url(#bg)"/>')

    # header ----------------------------------------------------------------
    add(t(48, 54, "DraftRecall state machine", 22, c["text"], weight=700))
    add(t(1052, 54, "dsh-composer-history · v0.8.16", 14, c["faint"],
          anchor="end", mono=True))
    add(t(48, 82, "keydown → gate → transition → single write path (setDraft); "
                  "recall edits the draft, only Enter sends", 14, c["sub"]))

    # gate strip ------------------------------------------------------------
    add(rect(48, 96, 1004, 76, 18, c["card"], c["stroke"], 1, shadow=True))
    add(t(68, 116, "KEYS", 14, c["faint"], weight=700, mono=True, spacing=1.5))
    keys = [("↑ ArrowUp", 100), ("↓ ArrowDown", 116), ("Esc", 49), ("Ctrl+R", 74)]
    kx = 68
    for label, kw in keys:
        accent = label.startswith("Ctrl")
        add(chip(kx, 124, kw, 34, label,
                 c["accent_soft"] if accent else c["rowbg"],
                 c["stroke"], c["accent"] if accent else c["body"], 14, True))
        kx += kw + 8
    add(t(443, 146, "→", 16, c["faint"]))
    add(t(462, 116, "GATE · any miss → pass (event untouched)", 14, c["faint"],
          weight=700, mono=True, spacing=0.5))
    gates = [("phase = plain", 115), ("menuOpen = false", 136),
             ("no IME / selection", 150), ("no Alt/Meta/Shift", 143)]
    gx = 462
    for i, (label, gw) in enumerate(gates):
        add(chip(gx, 124, gw, 34, label,
                 c["accent_soft"] if i == 0 else c["rowbg"],
                 c["stroke"], c["accent"] if i == 0 else c["body"], 14))
        gx += gw + 8

    # gate drops into both states ------------------------------------------
    add(f'<path d="M290 172V232" stroke="{c["accent"]}" stroke-width="2" '
        f'marker-end="url(#arr-acc)"/>')
    add(f'<path d="M810 172V232" stroke="{c["accent"]}" stroke-width="2" '
        f'marker-end="url(#arr-acc)"/>')
    add(t(302, 196, "same gate · both states", 14, c["faint"]))

    # IDLE state ------------------------------------------------------------
    add(rect(150, 240, 280, 190, 20, c["card"], c["stroke"], 1, shadow=True))
    add(t(176, 284, "IDLE", 22, c["accent"], weight=700, mono=True, spacing=1))
    add(t(176, 308, "not browsing · no stash", 14, c["sub"]))
    bullets = ["↓ always passes",
               "↑ off line 1 → pass",
               "↑ line 1 + history → browse",
               "session switch → reset"]
    for i, line in enumerate(bullets):
        add(t(176, 340 + i * 26, "·", 14, c["faint"]))
        add(t(190, 340 + i * 26, line, 14, c["body"]))

    # BROWSING state --------------------------------------------------------
    add(rect(660, 240, 300, 216, 20, c["card"], c["stroke"], 1, shadow=True))
    add(t(686, 284, "BROWSING", 22, c["accent"], weight=700, mono=True, spacing=0.5))
    add(t(686, 308, "index · savedDraft · savedCaret", 14, c["sub"]))
    rows = [("E0", "oldest", False), ("E1", "", True), ("E2", "…", False),
            ("E3", "newest", False)]
    for i, (tag, note, selected) in enumerate(rows):
        ry = 322 + i * 28
        add(rect(680, ry, 260, 24, 8,
                 c["accent_soft"] if selected else c["rowbg"],
                 c["accent"] if selected else None, 1.4))
        add(t(694, ry + 17, tag, 14, c["accent"] if selected else c["faint"], mono=True))
        if note:
            add(t(730, ry + 17, note, 14, c["sub"]))
        if selected:
            add(t(928, ry + 17, "index", 14, c["accent"], anchor="end", mono=True))
    add(t(686, 450, "↑ older · at index 0 → hold", 14, c["sub"]))

    # transitions -----------------------------------------------------------
    add(f'<path d="M430 300H654" stroke="{c["accent"]}" stroke-width="2.5" '
        f'marker-end="url(#arr-acc)"/>')
    add(t(438, 280, "↑ first line · history ≠ ∅", 14, c["accent"]))
    add(t(438, 324, "stash {draft, caret}", 14, c["sub"], mono=True))
    add(t(438, 344, "fill(newest) → setDraft", 14, c["sub"], mono=True))

    add(f'<path d="M654 390H436" stroke="{c["green"]}" stroke-width="2.5" '
        f'marker-end="url(#arr-grn)"/>')
    add(t(438, 414, "↓ last line / Esc", 14, c["green"]))
    add(t(438, 434, "restore savedDraft + caret", 14, c["sub"]))

    # effects + storage panel ----------------------------------------------
    add(rect(48, 470, 632, 146, 20, c["card"], c["stroke"], 1, shadow=True))
    add(t(70, 496, "EFFECT · STORAGE", 14, c["faint"], weight=700, mono=True, spacing=1))
    add(t(70, 522, "history[] = session + persisted + workspace + [compacted]",
          14, c["body"]))
    add(t(70, 544, "fill / restore → setDraft(text) — the only write path",
          14, c["body"]))
    add(t(70, 566, "lands in the ordinary composer draft · Enter is still yours",
          14, c["body"]))
    add(t(70, 588, "localStorage ×4 · history.v1 · snippets.v1 · templates.v1 · insights.v1",
          14, c["sub"], mono=True))
    add(t(70, 608, "bounded · schemaVersion 1 · Export JSON / Import file · no network",
          14, c["sub"], mono=True))

    # parallel search lane ---------------------------------------------------
    add(f'<path d="M1040 172V460" stroke="{c["faint"]}" stroke-width="1.6" '
        f'stroke-dasharray="6 6" marker-end="url(#arr-fnt)"/>')
    add(t(1028, 200, "bypasses states", 14, c["faint"], anchor="end"))

    add(rect(700, 470, 352, 146, 20, c["card"], c["stroke"], 1, shadow=True))
    add(t(720, 496, "Ctrl+R · PARALLEL LANE", 15, c["accent"], weight=700,
          mono=True, spacing=0.5))
    add(t(720, 522, "machine.reset() → openSearch()", 14, c["sub"], mono=True))
    add(t(720, 544, "sources: history · snippets", 14, c["body"]))
    add(t(720, 566, "templates · [compacted]", 14, c["body"]))
    add(t(720, 588, "actions: Export / Copy / Import JSON", 14, c["sub"], mono=True))
    add(t(720, 608, "pick → fill · Esc cancels", 14, c["sub"], mono=True))

    add('</svg>')
    return "\n".join(p) + "\n"


# ---------------------------------------------------------------------------
# entry point
# ---------------------------------------------------------------------------
def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    written: list[str] = []

    for lang in ("zh", "en"):
        for theme in ("light", "dark"):
            img = hero(lang, theme)
            path = os.path.join(OUT, f"{NAME}-hero-{lang}-{theme}.webp")
            img.convert("RGB").save(path, "WEBP", quality=92, method=6)
            written.append(path)

    for theme in ("light", "dark"):
        path = os.path.join(OUT, f"{NAME}-flow-v5-{theme}.svg")
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(flow_svg(theme))
        written.append(path)

    for path in written:
        print(f"wrote {os.path.relpath(path, ROOT)} "
              f"({os.path.getsize(path) // 1024} KB)")


if __name__ == "__main__":
    main()
