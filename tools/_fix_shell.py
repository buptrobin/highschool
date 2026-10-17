# -*- coding: utf-8 -*-
"""Restore page shell bits (title / h1 / pager / window.PAGE) from git HEAD.

Usage: python tools/_fix_shell.py pages/geo/xx1-c4-s3.html ...
"""
import re
import subprocess
import sys

PATTERNS = [
    r"<title>.*?</title>",
    r'<h1 class="page-title">.*?</h1>',
    r'<nav class="pager">.*?</nav>',
    r"window\.PAGE = \{.*?\};",
]


def head_version(path: str) -> str:
    return subprocess.run(
        ["git", "show", f"HEAD:{path.replace(os.sep, '/')}"],
        capture_output=True, check=True,
    ).stdout.decode("utf-8")


import os  # noqa: E402

for rel in sys.argv[1:]:
    cur = open(rel, encoding="utf-8").read()
    orig = head_version(rel)
    changed = []
    for pat in PATTERNS:
        m = re.search(pat, orig, re.S)
        if not m:
            continue
        new, n = re.subn(pat, lambda _m, s=m.group(0): s, cur, count=1, flags=re.S)
        if n and new != cur:
            cur = new
            changed.append(pat[:16])
    open(rel, "w", encoding="utf-8", newline="\n").write(cur)
    print(rel, "restored:", ",".join(changed) or "nothing")
