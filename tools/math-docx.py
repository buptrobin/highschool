"""math-docx.py —— 把数学真题 docx 拆成「文字 + 公式图」的可读片段

数学真题的公式在 docx 里是 Equation 3.0 OLE 对象：
- `word/embeddings/oleObjectN.bin` 是公式本体（无法解析）
- `word/media/imageN.wmf` 是预览用的矢量图（可用 GDI+ 渲染成高清 PNG）

python-docx 的 `paragraph.text` 只拼接 w:t，公式位置直接留空，所以整份卷子只能读出
1800 来个字（正常应有近万字）。本工具按文档顺序遍历段落里的 `w:t` 与 `v:imagedata`，
把公式换成 `<img>`，从而得到一份「形状正确」的题干。

用法：
    python tools/math-docx.py <docx> <输出目录> [--dpi 600]

输出（<输出目录> 下）：
    segs.json   段落数组：[{"html": "...<img src=\"img/image3.png\" style=\"...\">...", "text": "纯文本"}]
    img/*.png   公式图（由 tools/wmf2png.ps1 渲染，600dpi）

注意：
- WMF 的逻辑尺寸单位是 1/100 mm，换算成 96dpi 的像素才等于 Word 里的观感尺寸；
  行内小图用 `vertical-align:baseline`，比正文高的（分式、根式、矩阵）用 `middle`，
  否则分式会整体往下掉。
- 只处理 body 里的段落（表格里的题干没见过，遇到再加）。
"""
import io
import json
import os
import re
import subprocess
import sys
import zipfile
from xml.sax.saxutils import escape

from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS = {"w": W, "v": "urn:schemas-microsoft-com:vml", "r": R}
HERE = os.path.dirname(os.path.abspath(__file__))


def rel_targets(z):
    rels = etree.fromstring(z.read("word/_rels/document.xml.rels"))
    return {r.get("Id"): r.get("Target") for r in rels}


def para_segments(p_el, rid2t):
    """按文档顺序产出 ("t", 文本) / ("img", media 路径) / ("br", "") / ("tab", "")"""
    segs = []
    for node in p_el.iter():
        tag = etree.QName(node).localname
        if tag == "t" and node.text:
            segs.append(("t", node.text))
        elif tag == "imagedata":
            rid = node.get("{%s}id" % R)
            segs.append(("img", rid2t.get(rid)))
        elif tag == "br":
            segs.append(("br", ""))
        elif tag == "tab":
            segs.append(("tab", ""))
    return segs


def wmf_size_mm(path):
    """读 WMF 头里的 bbox（单位 1/100 mm = 0.01mm? 实际是 1/100 mm 的 twips 单位）
    简化：用 GDI+ 读 Metafile 的逻辑尺寸；这里退回用 PIL 也能读，但 PIL 的 size 是像素。
    实际尺寸由 wmf2png 的 PNG 像素数 / dpi 反推，见 img_html()。"""
    return None


def img_html(rel, png_path, dpi):
    """生成行内 img 标签：按 96dpi 的像素尺寸设定显示高度"""
    from PIL import Image

    with Image.open(png_path) as im:
        wpx, hpx = im.size
    # PNG 是按 dpi 渲染的，换算回 96dpi 下的显示尺寸
    h96 = hpx * 96.0 / dpi
    w96 = wpx * 96.0 / dpi
    h = max(8.0, round(h96, 1))
    va = "middle" if h96 > 22 else "baseline"
    return '<img class="mf" src="%s" style="height:%.1fpx;vertical-align:%s" alt="">' % (
        rel.replace("\\", "/"),
        h,
        va,
    )


def convert(src, outdir, dpi=600, force=False):
    os.makedirs(outdir, exist_ok=True)
    imgdir = os.path.join(outdir, "img")
    os.makedirs(imgdir, exist_ok=True)
    rawdir = os.path.join(outdir, "raw")
    os.makedirs(rawdir, exist_ok=True)

    z = zipfile.ZipFile(src)
    rid2t = rel_targets(z)
    root = etree.fromstring(z.read("word/document.xml"))

    # 先把除公式外、以及公式用到的所有 wmf 落到 raw/ 再批量转换
    wmfs = [n for n in z.namelist() if n.lower().endswith(".wmf")]
    for n in wmfs:
        p = os.path.join(rawdir, os.path.basename(n))
        if force or not os.path.exists(p):
            with open(p, "wb") as fh:
                fh.write(z.read(n))
    # 其它格式的图（真题配图常见 png/jpeg/emf）原样拷出
    for n in z.namelist():
        if n.startswith("word/media/") and not n.lower().endswith(".wmf"):
            p = os.path.join(rawdir, os.path.basename(n))
            if force or not os.path.exists(p):
                with open(p, "wb") as fh:
                    fh.write(z.read(n))

    ps1 = os.path.join(HERE, "wmf2png.ps1")
    subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            ps1,
            "-InDir",
            rawdir,
            "-OutDir",
            imgdir,
            "-Dpi",
            str(dpi),
        ],
        check=True,
    )

    def media_png(target):
        """media/imageN.wmf → img/imageN.png（相对 outdir）"""
        base = os.path.basename(target)
        stem, ext = os.path.splitext(base)
        if ext.lower() == ".wmf":
            p = os.path.join(imgdir, stem + ".png")
            if os.path.exists(p):
                return "img/%s.png" % stem, p
        p = os.path.join(rawdir, base)
        if os.path.exists(p):
            return "raw/%s" % base, p
        return None, None

    segs = []
    body = root.find(".//w:body", NS)
    for p_el in body.findall("w:p", NS):
        parts = []
        for kind, val in para_segments(p_el, rid2t):
            if kind == "t":
                parts.append(escape(val))
            elif kind == "tab":
                parts.append(" ")
            elif kind == "br":
                parts.append("<br>")
            elif kind == "img" and val:
                rel, p = media_png(val)
                if not p:
                    continue
                if rel.endswith(".png"):
                    parts.append(img_html(rel, p, dpi))
                else:
                    parts.append('<img src="%s" alt="">' % rel)
        html = "".join(parts).strip()
        text = re.sub(r"<[^>]+>", "", html).strip()
        if html:
            segs.append({"html": html, "text": text})
    with io.open(os.path.join(outdir, "segs.json"), "w", encoding="utf-8", newline="\n") as fh:
        json.dump(segs, fh, ensure_ascii=False, indent=1)
    return segs


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    src, outdir = sys.argv[1], sys.argv[2]
    dpi = 600
    if "--dpi" in sys.argv:
        dpi = int(sys.argv[sys.argv.index("--dpi") + 1])
    segs = convert(src, outdir, dpi)
    print("段落 %d 条 → %s" % (len(segs), os.path.join(outdir, "segs.json")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
