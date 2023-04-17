#!/bin/bash -eu

version_string=$(jq -r '.version' package.json)
pr=$( (git log --oneline @...v"$version_string" || git log --oneline) | sed -nE 's/.+\((#[0-9]+)\)$/\1/p')
labels=$( echo "$pr" | xargs -n1 gh pr view --json labels -q '.labels[].name')
mapfile -t version < <(printf '%s\n' "${version_string//./$'\n'}")
if printf '%s\n' "${labels[@]}" | grep -qx 'semver:major'; then
  ((++version[0]))
  version[1]=0
  version[2]=0
elif printf '%s\n' "${labels[@]}" | grep -qx 'semver:minor'; then
  ((++version[1]))
  version[2]=0
elif printf '%s\n' "${labels[@]}" | grep -qx 'semver:patch'; then
  ((++version[2]))
elif printf '%s\n' "${labels[@]}" | grep -qx 'semver:none'; then
  exit 0
fi
new_version_string=$(printf ".%s" "${version[@]}")
new_version_string=${new_version_string:1}
git switch -C release
VERSION=$new_version_string perl -i -pe 's/(  "version": ").+/\1$ENV{VERSION}",/ if !$done; $done ||= $&' package.json
echo -e "Release v${new_version_string}\n\nPR:\n${pr}" | git commit --no-gpg-sign -a --file=-
git push -f
gh pr create --base main --fill --label release || echo -e "PR:\n${pr}" | gh pr edit --title "Release v${new_version_string}" --body-file -
gh pr merge --auto --delete-branch --squash
