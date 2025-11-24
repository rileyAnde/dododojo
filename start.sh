#!/usr/bin/env bash

echo "starting all services..."

start_in_terminal() {
    local title="$1"
    local cmd="$2"

    case "$OSTYPE" in
        linux*)
            # try gnome-terminal, then xterm, then konsole
            if command -v gnome-terminal >/dev/null 2>&1; then
                gnome-terminal --title="$title" -- bash -c "$cmd; exec bash"
            elif command -v konsole >/dev/null 2>&1; then
                konsole --new-tab -p tabtitle="$title" -e bash -c "$cmd; exec bash"
            elif command -v xterm >/dev/null 2>&1; then
                xterm -T "$title" -hold -e bash -c "$cmd"
            else
                echo "No supported Linux terminal found (gnome-terminal, konsole, xterm)."
            fi
            ;;
        darwin*)
            # macOS Terminal.app
            osascript <<EOF
tell application "Terminal"
    do script "cd \"$(pwd)\"; $cmd"
    set custom title of selected tab of front window to "$title"
end tell
EOF
            ;;
        msys*|cygwin*|mingw*)
            # git bash / MSYS2 / Cygwin on Windows using Windows Terminal or PowerShell
            if command -v wt.exe >/dev/null 2>&1; then
                wt.exe --title "$title" bash -lc "$cmd"
            else
                powershell.exe -NoExit -Command "cd \"$(pwd)\"; $cmd"
            fi
            ;;
        *)
            echo "Unsupported OS: $OSTYPE"
            ;;
    esac
}

# Start all three services
start_in_terminal "Server"   "./start_server.sh"
start_in_terminal "Backend"  "./start_backend.sh"
start_in_terminal "Frontend" "./start_dev.sh"
