#!/usr/bin/env bash
# Local preview of the profile README, rendered by GitHub's own Markdown API.
# usage (from the repo root): bash .github/preview.sh [port]
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${1:-8080}"
OUT=".preview"
mkdir -p "$OUT"

node .github/build-svgs.mjs images

BODY="$(gh api markdown -f text="$(cat README.md)" -f mode=gfm -f context=GoularteLB/GoularteLB)"

page() { # $1 = light|dark
  cat <<HTML
<!doctype html><html lang="en" data-color-mode="$1" data-light-theme="light" data-dark-theme="dark">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>README preview · $1</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown-$1.css">
<style>
  body{margin:0;background:$( [ "$1" = dark ] && echo '#0d1117' || echo '#ffffff' )}
  .bar{position:sticky;top:0;z-index:1;display:flex;gap:12px;justify-content:center;padding:10px;font:14px system-ui;background:#161b22;color:#c9d1d9}
  .bar a{color:#58a6ff}
  .markdown-body{box-sizing:border-box;max-width:1012px;margin:24px auto;padding:32px;border:1px solid $( [ "$1" = dark ] && echo '#30363d' || echo '#d0d7de' );border-radius:6px}
</style></head>
<body><div class="bar">tema: <a href="light.html">light</a> · <a href="dark.html">dark</a> · <a href="mobile.html">mobile</a></div>
<article class="markdown-body">
$( if [ "$1" = dark ]; then echo "$BODY" | sed 's|<source media="(prefers-color-scheme: dark)" srcset="\([^"]*\)"[^>]*>|<source srcset="\1">|g'; else echo "$BODY" | sed 's|<source media="(prefers-color-scheme: dark)"[^>]*>||g'; fi )
</article></body></html>
HTML
}

page light > "$OUT/light.html"
page dark  > "$OUT/dark.html"
cat > "$OUT/mobile.html" <<HTML
<!doctype html><meta charset="utf-8"><title>mobile</title>
<body style="margin:0;background:#010409;display:flex;justify-content:center;padding:24px">
<iframe src="dark.html" style="width:390px;height:844px;border:10px solid #30363d;border-radius:36px;background:#0d1117"></iframe>
HTML

ln -sfn ../images "$OUT/images"
echo "→ http://localhost:$PORT/dark.html   (Ctrl+C para sair)"
(sleep 1 && xdg-open "http://localhost:$PORT/dark.html" >/dev/null 2>&1 || true) &
python3 -m http.server "$PORT" --directory "$OUT" --bind 127.0.0.1
