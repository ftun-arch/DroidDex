#!/bin/bash

TARGET_DIR="/usr/share/droiddex"
ARCH=$(uname -m)

cd /tmp
echo "Download DroidDex for $ARCH architecture..."
curl -LO https://github.com/ftun-arch/DroidDex/raw/refs/heads/main/core/droiddex-$ARCH.tar.gz > /dev/null 2>&1
echo "Extracting DroidDex..."
tar -xvf droiddex-$ARCH.tar.gz > /dev/null 2>&1
echo "Installing DroidDex..."
cp -r usr/share/droiddex/* $TARGET_DIR > /dev/null 2>&1
echo "Cleaning up..."
rm -rf droiddex-$ARCH.tar.gz > /dev/null 2>&1
rm -rf usr/share/droiddex/* > /dev/null 2>&1
echo "DroidDex-Core installed successfully!"
