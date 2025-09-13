#!/bin/bash
set -e

TARGET_DIR="/usr/share/droiddex"
ARCH=$(uname -m)
TEMP_DIR=$(mktemp -d)

mkdir -p "$TARGET_DIR"

echo "==> Downloading DroidDex for $ARCH architecture..."
curl -sSL "https://github.com/ftun-arch/DroidDex/raw/dev/core/droiddex-$ARCH.tar.gz" -o "$TEMP_DIR/droiddex.tar.gz"

echo "==> Extracting DroidDex..."
tar -xzf "$TEMP_DIR/droiddex.tar.gz" -C "$TEMP_DIR"

echo "==> Installing DroidDex files..."
cp -r "$TEMP_DIR"/usr/share/droiddex/* "$TARGET_DIR"/
chmod +x "$TARGET_DIR"/droiddex

echo "==> Cleaning up..."
rm -rf "$TEMP_DIR"

echo "✅ DroidDex-Core installed successfully!"
