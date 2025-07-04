#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# You can modify these variables for other packages.
PACKAGE_NAME="@sora8964/expo-config-plugin-android-variants"
REPO_URL="git@github.com:sora8964/expo-config-plugin-android-variants.git"
# --- End of Configuration ---

echo "Fetching remote tags from $REPO_URL..."

LATEST_TAG=$(git ls-remote --tags --refs "$REPO_URL" | \
    awk '{print $2}' | \
    sed 's#refs/tags/##' | \
    grep '^v[0-9]\+\.[0-9]\+\.[0-9]\+$' | \
    sort -V | \
    tail -n 1)

if [ -z "$LATEST_TAG" ]; then
    echo "Error: No valid semantic version tags (e.g., v1.0.0) found in the remote repository."
    exit 1
fi

echo "Latest version found: $LATEST_TAG"

INSTALL_URL="git+ssh://$REPO_URL#$LATEST_TAG"
INSTALL_TARGET="$PACKAGE_NAME@$INSTALL_URL"

echo "Preparing to install: $INSTALL_TARGET"

npm install "$INSTALL_TARGET"

echo "Installation of $PACKAGE_NAME version $LATEST_TAG completed successfully."