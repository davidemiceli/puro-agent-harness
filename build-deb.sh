#!/bin/bash
set -e

# --- Configuration ---
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")
ARCH="amd64"
OUTPUT_DIR="out"
BUILD_DIR="out-tmp"
WORKING_DIR="${BUILD_DIR}/${PACKAGE_NAME}"
OUTPUT_DEB="${OUTPUT_DIR}/${PACKAGE_NAME}_${PACKAGE_VERSION}_${ARCH}.deb"
ICON_512="electron/assets/icons/${PACKAGE_NAME}_512.png"
ICON_SVG="electron/assets/icons/${PACKAGE_NAME}.svg"
MAINTAINER_NAME="Your Name"
MAINTAINER_EMAIL="your.email@example.com"

# --- Start Build Package ---

# Create working and output folders
mkdir -p "${WORKING_DIR}" "${OUTPUT_DIR}"

# Build frontend app
npm run build

# Create debian package
npm run make

# Extract content of debian package
dpkg-deb -x "${BUILD_DIR}/make/deb/x64/${PACKAGE_NAME}_${PACKAGE_VERSION}_${ARCH}.deb" "${WORKING_DIR}"
dpkg-deb -e "${BUILD_DIR}/make/deb/x64/${PACKAGE_NAME}_${PACKAGE_VERSION}_${ARCH}.deb" "${WORKING_DIR}/DEBIAN"

# Create the modern icon directory if it doesn't exist
mkdir -p "${WORKING_DIR}/usr/share/icons/hicolor/512x512/apps/"
mkdir -p "${WORKING_DIR}/usr/share/icons/hicolor/scalable/apps/"

# Copy your icon there
cp "${ICON_512}" "${WORKING_DIR}/usr/share/icons/hicolor/512x512/apps/${PACKAGE_NAME}.png"
cp "${ICON_SVG}" "${WORKING_DIR}/usr/share/icons/hicolor/scalable/apps/${PACKAGE_NAME}.svg"

# Add mantainer to puro/DEBIAN/control
# echo "Maintainer: ${MAINTAINER_NAME} <${MAINTAINER_EMAIL}>" >> "${WORKING_DIR}/DEBIAN/control"

# Could need this permission (but skip it for now)
# chmod 755 puro/DEBIAN/control (if needed)

# Rebuild the deb package
dpkg-deb --root-owner-group --build "${WORKING_DIR}" "${OUTPUT_DEB}"

# Cleaning temp output directory
rm -rf "${BUILD_DIR}"

echo "Debian package built: ${OUTPUT_DEB}"
