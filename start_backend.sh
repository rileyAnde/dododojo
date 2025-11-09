## script to start the backend server -- this should run in a
## separate terminal from the frontend server
#!/bin/bash
cd src/db_interface || exit

if [[ "$(uname)" == "Darwin" ]]; then
    echo "Running on macOS"
    ./db_interface_mac
else
    echo "Running on Windows"
    ./db_interface_win.exe
fi