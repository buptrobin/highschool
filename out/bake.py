# -*- coding: utf-8 -*-
"""把 spec 里的 @@IMG:key@@ 占位符换成 base64 内嵌 <img>，并把该 figure 从 figures 中移除。

用法：python out/bake.py <raw.json> <final.json>
"""
import base64
import json
import os
import re
import sys

ROOT = r"C:\wangxp\mygit\highschool"
TOK = re.compile(r"@@IMG:([A-Za-z0-9_]+)@@")


def main():
    raw_path, out_path = sys.argv[1], sys.argv[2]
    sp = json.load(open(raw_path, encoding="utf-8"))
    figs = sp.get("figures", {})
    used = set()

    def sub(text):
        def rep(m):
            key = m.group(1)
            if key not in figs:
                raise SystemExit("figure 缺失：" + key)
            used.add(key)
            f = figs[key]
            p = os.path.join(ROOT, f["img"].replace("/", os.sep))
            b64 = base64.b64encode(open(p, "rb").read()).decode("ascii")
            mw = f.get("maxw", 700)
            alt = f.get("alt", "")
            return ("<p style='margin:10px 0'><img alt='%s' src='data:image/png;base64,%s' "
                    "style='display:block;max-width:%dpx;width:100%%;height:auto;border-radius:6px'></p>"
                    % (alt, b64, mw))

        return TOK.sub(rep, text)

    for es in sp.get("essays", []):
        if es.get("material"):
            es["material"] = sub(es["material"])

    for key in used:
        figs.pop(key, None)
    sp["figures"] = figs

    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(sp, fh, ensure_ascii=False, indent=2)
    print("baked %s -> %s（内嵌图 %d 张，剩余 figures %d 个，%.1f KB）"
          % (raw_path, out_path, len(used), len(figs), os.path.getsize(out_path) / 1024))


if __name__ == "__main__":
    main()
