# Functions: 
# main: start the database interface for the application
# Inputs: none
# Outputs: starts the database interface in terminal
# Authors: Hannah Smith 

## script to start the backend server -- this should run in a
## separate terminal from the frontend server

#!/bin/bash
cd src/db_interface || exit
# determine OS and run appropriate binary
if [[ "$(uname)" == "Darwin" ]]; then
    echo "Running on macOS"
    ./db_interface_mac
elif [[ "$(uname)" == "Linux" ]]; then
    echo "Running on Linux"
    ./db_interface_linux
else
    echo "Running on Windows"
    ./db_interface_win.exe
fi