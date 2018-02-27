#!/usr/bin/env bash
if [[ "$OSTYPE" == "linux-gnu" ]]; then
        ./create-symlink-unix.sh
elif [[ "$OSTYPE" == "darwin"* ]]; then
        ./create-symlink-unix.sh
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" || "$OSTYPE" == "msys" ]]; then
        ./create-symlink-win.bat
else
    printf "symlink creation: unsupported os";
fi