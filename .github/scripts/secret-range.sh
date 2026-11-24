#!/usr/bin/env bash
set -euo pipefail

is_sha() { [[ $1 =~ ^[0-9a-f]{40}$ ]]; }
is_commit() { [[ $(git cat-file -t "$1") == commit ]]; }

base=${1:-}
head=${2:-}
if ! is_sha "$base" || ! is_sha "$head" || ! is_commit "$head"; then
  echo 'Secret scan requires valid before and head SHAs and an available head commit.' >&2
  exit 1
fi

if [[ $base == 0000000000000000000000000000000000000000 ]]; then
  # A newly created ref has no old tip. Scan all history reachable from the new tip.
  printf '%s\n' "$head"
elif is_commit "$base"; then
  printf '%s..%s\n' "$base" "$head"
else
  echo 'Secret scan base commit is unavailable.' >&2
  exit 1
fi
