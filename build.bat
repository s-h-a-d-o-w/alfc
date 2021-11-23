rmdir /S /Q dist

cd bootstrap
call yarn build
cd ..\server
call yarn build
cd ..\frontend
call yarn build
cd ..

xcopy /I /E bootstrap\dist dist
copy bootstrap\scripts\*.* dist

xcopy /I /E server\dist dist\fancontrol
copy server\native\windows\*.dll dist\fancontrol
xcopy /I /E server\node_modules\edge-js\lib\native dist\fancontrol\native

xcopy /I /E frontend\build dist\fancontrol\frontend

@REM Adding default config and package.json
copy alfc.config.json dist
copy package.json dist

@REM Remove native dependencies that don't match the node version we use
cd dist\fancontrol\native\win32
rmdir /S /Q ia32
move x64\12.13.0 12.13.0 
rmdir /S /Q x64
mkdir x64
move 12.13.0 x64\12.13.0
cd ..\..\..\

powershell Compress-Archive * alfc-without-node.zip
move alfc-without-node.zip ..\alfc-without-node.zip
curl --output node.exe https://nodejs.org/dist/latest-v12.x/win-x64/node.exe
powershell Compress-Archive * alfc.zip
move ..\alfc-without-node.zip alfc-without-node.zip

cd ..
