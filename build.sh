#!/bin/bash
set -ex

rm -rf dist

pnpm build

cp -r bootstrap/dist .
cp bootstrap/scripts/linux/* dist

cp -r server/dist dist/fancontrol
# TODO: Somehow include the acpi-call unit? I'm not sure whether that make sense.

cp -r frontend/build dist/fancontrol/frontend

cp alfc.config.json dist
cp package.json dist

cd dist
mkdir alfc
shopt -s extglob
mv !(alfc) ./alfc
tar -czf alfc.tar.gz alfc

cd ..
