#!/usr/bin/env bash
# Set up sitekit on this machine: system packages, the managed install that follows signed releases, the pulse daemon,
# panel icon and browser host, a pulse.toml whose project scan fits this machine, and the daily timers. Safe to run
# again: each step checks what's there and only does what's missing, so it also repairs a half-set-up machine.
#
#   curl -fsSL https://raw.githubusercontent.com/un1tz3r0/un1tz3r0.github.io/master/tools/setup.sh | bash
#   tools/setup.sh [options]          # from a checkout
#
# Options:
#   --dev            install your checkout editable with pipx instead of the managed release (no self-updates)
#   --trust FILE     trust this release signing public key instead of the signing keys on your GitHub account
#   --no-system      don't install packages, GNOME extensions or change sysctl (nothing outside ~)
#   --no-timers      skip the daily refresh and backup timers
#   --dry-run        print what would change without changing anything
#   -h, --help       this text
#
# Everything lands under ~/.local/share/sitekit, ~/.config/sitekit, ~/.config/systemd/user and ~/.local/bin.
set -euo pipefail

REPO_HTTPS=${SITEKIT_REPO:-https://github.com/un1tz3r0/un1tz3r0.github.io.git}
REPO_SSH=${SITEKIT_REPO:-git@github.com:un1tz3r0/un1tz3r0.github.io.git}
OWNER=un1tz3r0
# Release tags (pulse-v*) are trusted when signed by one of the SSH *signing* keys on OWNER's GitHub account (Settings ›
# SSH and GPG keys › New SSH key › Signing Key), fetched once when a machine is set up. The keys aren't kept in this
# repo, so a push to it can't add one. Login keys are deliberately not used. --trust FILE adds a key by hand instead.

HOME_DIR=$HOME/.local/share/sitekit
CONF_DIR=$HOME/.config/sitekit
CONFIG=$CONF_DIR/pulse.toml
SIGNERS=$CONF_DIR/allowed_signers
UNITS=$HOME/.config/systemd/user
BIN=$HOME/.local/bin
REFRESH_SITE=$HOME_DIR/refresh-site

DEV=0 SYSTEM=1 TIMERS=1 DRY=0 TRUST=
while [ $# -gt 0 ]; do
  case $1 in
    --dev) DEV=1 ;;
    --trust) TRUST=${2:?--trust needs a key file}; shift ;;
    --no-system) SYSTEM=0 ;;
    --no-timers) TIMERS=0 ;;
    --dry-run) DRY=1 ;;
    -h|--help) sed -n '2,/^set -e/p' "${BASH_SOURCE[0]:-/dev/null}" 2>/dev/null | sed '$d; s/^# \{0,1\}//'; exit 0 ;;
    *) echo "setup.sh: unknown option $1 (see --help)" >&2; exit 2 ;;
  esac
  shift
done

# ---------------------------------------------------------------------------------------------------------- helpers

if [ -t 1 ]; then B=$'\e[1m' G=$'\e[32m' Y=$'\e[33m' R=$'\e[31m' N=$'\e[0m'; else B= G= Y= R= N=; fi
step() { printf '\n%s== %s%s\n' "$B" "$*" "$N"; }
ok()   { printf '  %s✓%s %s\n' "$G" "$N" "$*"; }
note() { printf '  %s!%s %s\n' "$Y" "$N" "$*"; NOTES+=("$*"); }
die()  { printf '%ssetup.sh: %s%s\n' "$R" "$*" "$N" >&2; exit 1; }
has()  { command -v "$1" >/dev/null 2>&1; }
NOTES=()

# Run a command that changes something; with --dry-run, only show it.
run() {
  if [ "$DRY" = 1 ]; then printf '  would run: %s\n' "$*"; return 0; fi
  "$@"
}
# Write stdin to a file if its content differs; says whether it changed.
put() {
  local path=$1 mode=${2:-644} new; new=$(cat)
  if [ -f "$path" ] && [ "$(cat "$path")" = "$new" ]; then ok "$path unchanged"; return 0; fi
  if [ "$DRY" = 1 ]; then printf '  would write %s\n' "$path"; return 0; fi
  mkdir -p "$(dirname "$path")"
  printf '%s\n' "$new" > "$path.tmp" && chmod "$mode" "$path.tmp" && mv -f "$path.tmp" "$path"
  ok "wrote $path"
}
SUDO=
if [ "$(id -u)" != 0 ]; then has sudo && SUDO=sudo; fi
root() {
  if [ "$(id -u)" != 0 ] && [ -z "$SUDO" ]; then note "no sudo; run as root yourself: $*"; return 1; fi
  run $SUDO "$@"
}

SESSION=${XDG_SESSION_TYPE:-}
DESKTOP=${XDG_CURRENT_DESKTOP:-}
is_gnome() { case ":$DESKTOP:" in *GNOME*) return 0 ;; esac; return 1; }

# The checkout this script runs from, if any (empty when piped from curl).
CHECKOUT=
src=${BASH_SOURCE[0]:-}
if [ -n "$src" ] && [ -f "$src" ]; then
  d=$(cd "$(dirname "$src")/.." && pwd)
  [ -f "$d/site.toml" ] && [ -d "$d/tools/sitekit" ] && CHECKOUT=$d
fi
[ "$DEV" = 1 ] && [ -z "$CHECKOUT" ] && die "--dev installs a checkout; run tools/setup.sh from one (git clone $REPO_SSH)"

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

# ---------------------------------------------------------------------------------------------- system packages

system_packages() {
  step "System packages"
  if [ "$SYSTEM" = 0 ]; then ok "skipped (--no-system)"; return; fi
  # Wanted on every machine: git, Python with venv, ffmpeg (gallery), GTK 4 + libadwaita bindings (panel icon and
  # settings window). Then what this desktop needs for its idle and focus probes, and rclone if media is set up.
  local apt=(git python3 python3-venv python3-pip openssh-client curl ffmpeg python3-gi gir1.2-gtk-4.0 gir1.2-adw-1)
  local dnf=(git python3 python3-pip openssh-clients curl ffmpeg-free python3-gobject gtk4 libadwaita)
  local pac=(git python python-pip openssh curl ffmpeg python-gobject gtk4 libadwaita)
  if [ "$SESSION" = x11 ]; then apt+=(xprintidle); dnf+=(xprintidle); pac+=(xprintidle); fi
  if is_gnome && ! gnome_ext_present 'appindicator'; then
    apt+=(gnome-shell-extension-appindicator); dnf+=(gnome-shell-extension-appindicator); pac+=(gnome-shell-extension-appindicator)
  fi
  if site_value media remote | grep -q .; then apt+=(rclone); dnf+=(rclone); pac+=(rclone); fi

  if has apt-get; then
    local missing=()
    for p in "${apt[@]}"; do dpkg-query -W -f='${Status}' "$p" 2>/dev/null | grep -q 'ok installed' || missing+=("$p"); done
    if [ ${#missing[@]} = 0 ]; then ok "all present"; return; fi
    echo "  installing: ${missing[*]}"
    root env DEBIAN_FRONTEND=noninteractive apt-get update -qq || true
    # All at once, then one at a time if that fails, so one unavailable package doesn't block the rest.
    if ! root env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${missing[@]}"; then
      for p in "${missing[@]}"; do
        root env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "$p" || note "could not install $p"
      done
    fi
  elif has dnf; then
    root dnf install -y -q "${dnf[@]}" || note "some packages failed: dnf install ${dnf[*]}"
  elif has pacman; then
    root pacman -S --needed --noconfirm "${pac[@]}" || note "some packages failed: pacman -S ${pac[*]}"
  else
    note "unknown package manager; install git, Python 3.11+, ffmpeg, PyGObject with GTK 4 and libadwaita yourself"
  fi
  [ "$DESKTOP" = KDE ] && ! has kdotool && note "KDE: install kdotool (cargo install kdotool) so pulse sees the focused app"
  ok "done"
}

python_check() {
  PY=/usr/bin/python3; [ -x "$PY" ] || PY=$(command -v python3 || true)
  [ -n "$PY" ] || die "no python3"
  "$PY" -c 'import sys; sys.exit(sys.version_info < (3, 11))' || die "$PY is $("$PY" -V); sitekit needs 3.11+"
  has git || die "no git"
}

inotify() {
  step "File watching limit"
  local now; now=$(cat /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo 0)
  if [ "$now" -ge 524288 ]; then ok "fs.inotify.max_user_watches = $now"; return; fi
  if [ "$SYSTEM" = 0 ]; then note "fs.inotify.max_user_watches is $now; big project trees may need 524288"; return; fi
  echo 'fs.inotify.max_user_watches = 524288' | root tee /etc/sysctl.d/90-sitekit-inotify.conf >/dev/null \
    && root sysctl -q -w fs.inotify.max_user_watches=524288 && ok "raised from $now to 524288"
}

# ------------------------------------------------------------------------------------------- GNOME shell extensions

gnome_ext_present() { has gnome-extensions && gnome-extensions list 2>/dev/null | grep -qi "$1"; }

gnome_extensions() {
  is_gnome || return 0
  step "GNOME Shell extensions"
  has gnome-extensions || { note "gnome-extensions not found; skipped"; return; }
  # Panel icon: any AppIndicator/KStatusNotifierItem extension (Ubuntu ships its own).
  local ai; ai=$(gnome-extensions list 2>/dev/null | grep -i appindicator | head -1 || true)
  if [ -z "$ai" ]; then note "no AppIndicator extension; the panel icon won't show until one is installed"
  elif gnome-extensions list --enabled 2>/dev/null | grep -qx "$ai"; then ok "$ai enabled"
  else run gnome-extensions enable "$ai" && ok "enabled $ai"; fi
  # Focused app on Wayland: the Focused Window D-Bus extension, from extensions.gnome.org.
  [ "$SESSION" = wayland ] || return 0
  local uuid=focused-window-dbus@flexagoon.com
  if gnome-extensions list --enabled 2>/dev/null | grep -qx "$uuid"; then ok "$uuid enabled"; return; fi
  if ! gnome-extensions list 2>/dev/null | grep -qx "$uuid"; then
    if [ "$SYSTEM" = 0 ]; then note "install the Focused Window D-Bus extension so pulse sees the focused app"; return; fi
    local shell url
    shell=$(gnome-shell --version 2>/dev/null | grep -oE '[0-9]+' | head -1)
    url=$(curl -fsS "https://extensions.gnome.org/extension-info/?uuid=$uuid&shell_version=$shell" 2>/dev/null \
          | "$PY" -c 'import json,sys; print(json.load(sys.stdin).get("download_url",""))' 2>/dev/null || true)
    if [ -z "$url" ]; then note "no Focused Window D-Bus build for GNOME $shell; install it from extensions.gnome.org"; return; fi
    run curl -fsSL -o "$TMP/fw.zip" "https://extensions.gnome.org$url" && run gnome-extensions install --force "$TMP/fw.zip" \
      && ok "installed $uuid"
  fi
  # A freshly installed extension is only loaded by the shell after you log in again on Wayland.
  if run gnome-extensions enable "$uuid" 2>/dev/null; then ok "enabled $uuid"
  else
    run gsettings set org.gnome.shell enabled-extensions \
      "$(gsettings get org.gnome.shell enabled-extensions | "$PY" -c "import ast,sys; l=ast.literal_eval(sys.stdin.read().replace('@as ','')); print(l+['$uuid'] if '$uuid' not in l else l)")"
    note "log out and back in once so GNOME loads the Focused Window D-Bus extension"
  fi
}

# ------------------------------------------------------------------------------------------------ release repo

# The bare clone the managed install keeps; also where this script reads site.toml and the example config from.
REPO=$HOME_DIR/repo
repo_ready() {
  step "Release repository"
  if [ ! -d "$REPO" ]; then
    run mkdir -p "$HOME_DIR"
    run git clone --quiet --bare --filter=blob:none "$REPO_HTTPS" "$REPO"
    ok "cloned $REPO_HTTPS → $REPO"
  fi
  [ "$DRY" = 1 ] && [ ! -d "$REPO" ] && return 0
  git -C "$REPO" fetch --quiet origin '+refs/heads/master:refs/heads/master' '+refs/tags/pulse-v*:refs/tags/pulse-v*' \
    || note "could not fetch from $REPO_HTTPS; using what's there"
  ok "up to date with master"
}

# Read a value from site.toml: the checkout's if we run from one, else master's. Usage: site_value TABLE KEY
site_value() {
  local text
  if [ -n "$CHECKOUT" ]; then text=$(cat "$CHECKOUT/site.toml")
  elif [ -d "$REPO" ]; then text=$(git -C "$REPO" show master:site.toml 2>/dev/null) || return 0
  else return 0; fi
  printf '%s' "$text" | "${PY:-python3}" -c 'import sys, tomllib; v = tomllib.loads(sys.stdin.read()).get(sys.argv[1], {}).get(sys.argv[2], ""); print(v if isinstance(v, str) else "")' "$1" "$2" 2>/dev/null || true
}

trust_key() {
  step "Release signing keys"
  local keys
  if [ -n "$TRUST" ]; then
    [ -f "$TRUST" ] || die "--trust: no file $TRUST"
    keys=$(awk '{print $1, $2}' "$TRUST")
  else
    local why="has no SSH signing keys"
    keys=$(curl -fsS "https://api.github.com/users/$OWNER/ssh_signing_keys" 2>/dev/null \
           | "$PY" -c 'import json,sys; [print(k["key"]) for k in json.load(sys.stdin)]' 2>/dev/null) || why="couldn't be reached"
    if [ -z "$keys" ]; then
      if [ -s "$SIGNERS" ]; then note "github.com/$OWNER $why; keeping $SIGNERS as it is"; return 0; fi
      die "github.com/$OWNER $why, so no release can be trusted. Add the key releases are signed with: gh auth refresh -s admin:ssh_signing_key && gh ssh-key add KEY.pub --type signing --title sitekit-release (or pass --trust KEY.pub)"
    fi
  fi
  local kt kb fp
  while read -r kt kb _; do
    [ -n "$kb" ] || continue
    printf '%s %s\n' "$kt" "$kb" > "$TMP/key.pub"
    fp=$(ssh-keygen -lf "$TMP/key.pub" 2>/dev/null | awk '{print $2}') || die "not an SSH public key: $kt"
    if [ -f "$SIGNERS" ] && grep -qF "$kb" "$SIGNERS"; then ok "trusted already: $fp"; continue; fi
    if [ "$DRY" = 1 ]; then echo "  would trust $fp"; continue; fi
    mkdir -p "$CONF_DIR"; printf 'release namespaces="git" %s %s\n' "$kt" "$kb" >> "$SIGNERS"; chmod 600 "$SIGNERS"
    ok "trusting $fp ($([ -n "$TRUST" ] && echo "$TRUST" || echo "signing key on github.com/$OWNER"))"
  done <<<"$keys"
  return 0
}

# ----------------------------------------------------------------------------------------------------- pulse.toml

# Where your GitHub checkouts live: the folder among the usual ones holding the most repos with a remote on
# github.com/OWNER, and how deep below it they sit. Prints "root depth".
find_projects_root() {
  local best= bestn=0 bestd=1
  for d in "$HOME/Projects" "$HOME/projects" "$HOME/src" "$HOME/code" "$HOME/dev" "$HOME/git" "$HOME/repos" "$HOME/work" "$HOME/Code"; do
    [ -d "$d" ] || continue
    local n=0 deep=1
    while IFS= read -r g; do
      local repo=${g%/.git} rel
      git -C "$repo" remote -v 2>/dev/null | grep -qiE "github\.com[:/]$OWNER/" || continue
      n=$((n + 1)); rel=${repo#"$d"/}; rel=${rel//[!\/]/}; [ $(( ${#rel} + 1 )) -gt "$deep" ] && deep=$(( ${#rel} + 1 ))
    done < <(find "$d" -mindepth 2 -maxdepth 4 -name .git -type d -not -path '*/node_modules/*' 2>/dev/null)
    if [ "$n" -gt "$bestn" ]; then best=$d bestn=$n bestd=$deep; fi
  done
  if [ -n "$best" ]; then echo "~${best#"$HOME"} $bestd $bestn"; else echo "~ 3 0"; fi
}

config() {
  step "Pulse config"
  local root depth n; read -r root depth n < <(find_projects_root)
  if [ -f "$CONFIG" ]; then
    ok "$CONFIG exists; left as it is"
    local cur; cur=$(sed -n '/^\[discover\]/,/^\[/{s/^root *= *"\([^"]*\)".*/\1/p}' "$CONFIG")
    if [ "$n" -gt 0 ] && [ "$cur" != "$root" ]; then
      note "your repos look like they live in $root ($n found), but [discover] root is \"$cur\""
    else
      ok "project scan: $cur ($n repos on github.com/$OWNER found under $root)"
    fi
    return 0
  fi
  local example
  if [ -n "$CHECKOUT" ]; then example=$(cat "$CHECKOUT/tools/pulse.example.toml")
  else example=$(git -C "$REPO" show master:tools/pulse.example.toml) || die "no pulse.example.toml on master"; fi
  # From the example: the example's own project folders are dropped (the scan finds them), and the scan is pointed
  # at the folder your checkouts are in.
  printf '%s\n' "$example" \
    | sed -e '/^\[projects\]/,/^\[/{/^"~\//d}' \
          -e "/^\[discover\]/,/^\[/{s|^root = \"[^\"]*\"|root = \"$root\"|;s|^depth = [0-9]*|depth = $depth|}" \
    | put "$CONFIG" 600
  ok "project scan: $root, $depth level(s) deep ($n repos on github.com/$OWNER found there)"
}

# --------------------------------------------------------------------------------------------- sitekit install

SITEKIT=$BIN/sitekit
SITEKITCTL=$BIN/sitekitctl
# The installer itself is `sitekitctl install` (tools/sitekit/manage.py): it bootstraps the managed install, writes the
# pulse and update units, launchers, icons and browser host, and starts the daemon. This script prepares the machine
# around it, picks which release's installer to run, and puts the two commands on PATH.
# `sitekit` and `sitekitctl` on PATH, running whichever release is current.
shims() {
  for cmd in sitekit sitekitctl; do
    put "$BIN/$cmd" 755 <<EOF
#!/bin/sh
# $cmd from the managed install (written by tools/setup.sh); follows ~/.local/share/sitekit/current.
PYTHONPATH="$HOME_DIR/current/tools\${PYTHONPATH:+:\$PYTHONPATH}" exec "$HOME_DIR/venv/bin/python" -m $([ $cmd = sitekit ] && echo sitekit || echo sitekit.manage) "\$@"
EOF
  done
}
version_ge() { [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -1)" = "$2" ]; }

install_managed() {
  step "sitekit (managed: follows signed releases)"
  if has pipx && pipx list --short 2>/dev/null | grep -q '^sitekit '; then
    run pipx uninstall sitekit && ok "removed the pipx install (the managed one replaces it)"
  fi
  [ "$DRY" = 1 ] && [ ! -d "$REPO" ] && { echo "  would run sitekitctl install from the newest signed release"; return; }
  # The oldest release that carries sitekitctl, as master's installer says.
  local first cur
  first=$(git -C "$REPO" show master:tools/sitekit/manage.py 2>/dev/null | sed -n "s/^FIRST = '\(pulse-v[0-9.]*\)'.*/\1/p")
  first=${first:-pulse-v1.1.0}
  cur=$([ -L "$HOME_DIR/current" ] && basename "$(readlink "$HOME_DIR/current")" || true)
  if [ -n "$cur" ] && version_ge "${cur#pulse-v}" "${first#pulse-v}"; then
    ok "installed: $cur; running its installer to repair anything missing"
    shims
    run "$SITEKITCTL" install 2>&1 | sed 's/^/  /'
    return
  fi
  # Verify the newest release ourselves before running any of its code; its installer then takes over.
  local tag= t out refused=()
  for t in $(git -C "$REPO" tag -l 'pulse-v*' | sort -rV); do
    version_ge "${t#pulse-v}" "${first#pulse-v}" || { refused+=("$t: older than $first, which has the installer"); continue; }
    if out=$(git -C "$REPO" -c gpg.ssh.allowedSignersFile="$SIGNERS" verify-tag "$t" 2>&1); then tag=$t; break; fi
    refused+=("$t: signed by $(grep -o 'key SHA256:[^ ]*' <<<"$out" || echo nobody), not a key in $SIGNERS")
  done
  if [ -z "$tag" ]; then
    printf '  %s\n' "${refused[@]}" >&2
    die "no release from $first on is signed by a trusted key. Make one from an up-to-date master checkout with the key on your GitHub account (sitekit release ${first#pulse-v}), or use --dev."
  fi
  ok "$tag is signed by a trusted key"
  git -C "$REPO" archive "$tag" tools | tar -x -C "$TMP"
  local venv=$HOME_DIR/venv deps
  [ -x "$venv/bin/python" ] || run "$PY" -m venv --system-site-packages "$venv"
  deps=$("$PY" -c 'import sys,tomllib; print(" ".join(tomllib.load(open(sys.argv[1],"rb"))["project"]["dependencies"]))' "$TMP/tools/pyproject.toml")
  # shellcheck disable=SC2086
  run "$venv/bin/python" -m pip install --quiet --disable-pip-version-check $deps
  run env PYTHONPATH="$TMP/tools" "$venv/bin/python" -m sitekit.manage install --from "$REPO_HTTPS" 2>&1 | sed 's/^/  /'
  [ "${PIPESTATUS[0]}" = 0 ] || die "sitekitctl install failed; see above, then run this again"
  shims
}

install_dev() {
  step "sitekit (editable, from $CHECKOUT)"
  [ -L "$HOME_DIR/current" ] && die "a managed install is in $HOME_DIR; remove it first with: sitekitctl uninstall"
  has pipx || root apt-get install -y -qq pipx || die "install pipx first"
  for cmd in sitekit sitekitctl; do      # this script's shims for a managed install would shadow pipx's
    grep -qs 'written by tools/setup.sh' "$BIN/$cmd" && run rm -f "$BIN/$cmd"
  done
  run pipx install --force --editable --system-site-packages "$CHECKOUT/tools" >/dev/null && ok "pipx install -e $CHECKOUT/tools"
  run "$SITEKITCTL" install --dev 2>&1 | sed 's/^/  /'
}

# ------------------------------------------------------------------------------------------------------ timers

timers() {
  step "Daily timers"
  if [ "$TIMERS" = 0 ]; then ok "skipped (--no-timers)"; return; fi
  # sitekit-refresh: history, feed sync and the Claude usage scan in a checkout of its own (the daemon's checkout is
  # its alone), committed and pushed. Same as the GitHub workflow, plus what only this machine can see: its Claude
  # transcripts, which Claude Code deletes after a month.
  put "$HOME_DIR/refresh" 755 <<EOF
#!/usr/bin/env bash
# Run by sitekit-refresh.timer (written by tools/setup.sh). This checkout is only ever written by this script, so it
# is reset to origin before each run and the data rebuilt, which avoids merge conflicts with the workflow and daemon.
set -uo pipefail
site="$REFRESH_SITE"
sitekit="$SITEKIT"
if [ ! -d "\$site/.git" ]; then
  git clone --quiet --branch master --filter=blob:none --sparse "$REPO_HTTPS" "\$site" && git -C "\$site" sparse-checkout set data || exit 1
  git -C "\$site" remote set-url --push origin "$REPO_SSH"
fi
export GITHUB_TOKEN=\${GITHUB_TOKEN:-\$(gh auth token 2>/dev/null)}
failed=0
for attempt in 1 2 3; do
  git -C "\$site" fetch --quiet origin master && git -C "\$site" checkout --quiet -B master origin/master \\
    && git -C "\$site" reset --quiet --hard origin/master || exit 1
  "\$sitekit" --site "\$site" history || failed=1
  "\$sitekit" --site "\$site" --no-commit sync || failed=1   # committed below, with the rest
  "\$sitekit" --site "\$site" claude scan || failed=1
  git -C "\$site" add data
  if git -C "\$site" diff --cached --quiet; then echo 'nothing changed'; exit \$failed; fi
  git -C "\$site" -c user.name="\$(git config --global user.name || echo sitekit)" \\
      -c user.email="\$(git config --global user.email || echo sitekit@localhost)" \\
      commit --quiet -m "refresh: \$(hostname -s) \$(date '+%Y-%m-%d %H:%M')"
  "\$sitekit" --site "\$site" push && exit \$failed
  echo "push failed (attempt \$attempt); rebuilding on the newer master"
  sleep 30
done
exit 1
EOF
  put "$UNITS/sitekit-refresh.service" <<EOF
[Unit]
Description=sitekit: commit history, feeds and Claude usage
After=network-online.target

[Service]
Type=oneshot
ExecStart=$HOME_DIR/refresh
Nice=10
EOF
  put "$UNITS/sitekit-refresh.timer" <<'EOF'
[Unit]
Description=Daily sitekit refresh

[Timer]
OnCalendar=*-*-* 03:30
Persistent=true
RandomizedDelaySec=1h

[Install]
WantedBy=timers.target
EOF
  local timers=(sitekit-refresh.timer)

  # sitekit-backup: only once [media] names a bucket and a backup folder.
  local remote backup
  remote=$(site_value media remote); backup=$(site_value media backup)
  if [ -n "$remote" ] && [ -n "$backup" ]; then
    local dir=${backup/#\~/$HOME} mount= cond=
    mount=$(findmnt -n -o TARGET --target "$dir" 2>/dev/null || true)
    # Only when the backup disk is plugged in, if it's a disk of its own.
    [ -n "$mount" ] && [ "$mount" != / ] && [ "$mount" != "$HOME" ] && cond="ConditionPathIsMountPoint=$mount"
    put "$UNITS/sitekit-backup.service" <<EOF
[Unit]
Description=sitekit: back up the media bucket to $backup
$cond

[Service]
Type=oneshot
ExecStart=$SITEKIT --site $REFRESH_SITE backup
EOF
    put "$UNITS/sitekit-backup.timer" <<'EOF'
[Unit]
Description=Daily sitekit backup

[Timer]
OnCalendar=daily
Persistent=true
RandomizedDelaySec=30m

[Install]
WantedBy=timers.target
EOF
    timers+=(sitekit-backup.timer)
    has rclone || note "[media] uses rclone, which isn't installed"
  else
    ok "no backup timer: [media] remote and backup aren't set in site.toml (run this again once they are)"
  fi
  if has systemctl; then
    run systemctl --user daemon-reload
    run systemctl --user enable --now "${timers[@]}" 2>&1 | sed 's/^/  /'
    ok "enabled ${timers[*]}"
  else
    note "no systemd; run $HOME_DIR/refresh daily from cron instead"
  fi
}

# ------------------------------------------------------------------------------------------------- session env

session_env() {
  # GNOME and KDE pass DISPLAY/WAYLAND_DISPLAY and SSH_AUTH_SOCK to user services; other sessions need telling.
  if is_gnome || [ "$DESKTOP" = KDE ] || [ -z "$DESKTOP" ]; then return 0; fi
  note "$DESKTOP: add 'systemctl --user import-environment DISPLAY WAYLAND_DISPLAY SSH_AUTH_SOCK' to your session startup"
}

# ------------------------------------------------------------------------------------------------------ check

check() {
  step "Check"
  [ "$DRY" = 1 ] && { echo "  (dry run)"; return; }
  case ":$PATH:" in *":$BIN:"*) ;; *) note "$BIN is not on your PATH; add it to use the sitekit command";; esac
  if has systemctl; then
    sleep 3
    if systemctl --user is-active -q sitekit-pulse; then ok "sitekit-pulse is running"
    else note "sitekit-pulse is not running: journalctl --user -u sitekit-pulse"; fi
  fi
  timeout 90 "$SITEKITCTL" verify 2>&1 | sed 's/^/  /' || note "sitekitctl verify found a problem (above)"
}

# -------------------------------------------------------------------------------------------------------- main

printf '%ssitekit setup%s  (%s %s%s)\n' "$B" "$N" "${DESKTOP:-no desktop}" "${SESSION:-}" "$([ "$DRY" = 1 ] && echo ', dry run')"
system_packages
python_check
inotify
gnome_extensions
if [ "$DEV" = 1 ]; then
  config
  install_dev
else
  repo_ready
  trust_key
  config
  install_managed
fi
timers
session_env
check

step "Left for you"
ext=$HOME_DIR/current/tools/sitekit/extension; [ "$DEV" = 1 ] && ext=$CHECKOUT/tools/sitekit/extension
echo "  - Browser extension, unless sitekitctl said it's loaded: chrome://extensions › Developer mode › Load unpacked › $ext"
echo "  - Review what pulse publishes: sitekit settings (or edit $CONFIG)"
for n in "${NOTES[@]}"; do echo "  - $n"; done
