#!/bin/bash
set -ex

rm -rf dist

pnpm build

cp -r bootstrap/dist .
cp bootstrap/scripts/linux/* dist

cp -r server/dist dist/fancontrol
# TODO: Equivalent to this would be somehow including the acpi-call unit
# copy server/native/windows/*.dll dist/fancontrol
# xcopy /I /E server/node_modules/edge-js/lib/native dist/fancontrol/native

cp -r frontend/build dist/fancontrol/frontend

cp alfc.config.json dist
cp package.json dist

cd dist
mkdir alfc
shopt -s extglob
mv !(alfc) ./alfc
tar -czf alfc.tar.gz alfc

cd ..
