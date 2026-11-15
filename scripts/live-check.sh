#!/usr/bin/env bash
# Post-deploy check of the live site. Run by the deploy workflow (the cloud team sandbox cannot reach cappycalc.com).
# Usage: scripts/live-check.sh [base-url]
set -uo pipefail
BASE="${1:-https://cappycalc.com}"
fail=0
check() { # url, expected substring (optional)
  local body code
  body=$(curl -sL --max-time 20 -w '\n%{http_code}' "$1") || { echo "✗ $1 unreachable"; fail=1; return; }
  code="${body##*$'\n'}"; body="${body%$'\n'*}"
  if [ "$code" != 200 ]; then echo "✗ $1 → $code"; fail=1; return; fi
  if [ -n "${2:-}" ] && ! grep -qF -- "$2" <<<"$body"; then echo "✗ $1 missing: $2"; fail=1; return; fi
  echo "✓ $1"
}
check "$BASE/" 'adsbygoogle.js?client=ca-pub-7888535375567084'
check "$BASE/ads.txt" 'pub-7888535375567084, DIRECT'
check "$BASE/robots.txt" 'Sitemap:'
check "$BASE/sitemap.xml" '<urlset'
check "$BASE/privacy/" 'Privacy'
# A random sample of the sitemap.
while read -r u; do check "$u" '<h1'; done < <(curl -sL --max-time 20 "$BASE/sitemap.xml" | grep -o '<loc>[^<]*' | sed 's/<loc>//' | awk 'BEGIN{srand()} {print rand() "\t" $0}' | sort | cut -f2 | head -12)
exit $fail
