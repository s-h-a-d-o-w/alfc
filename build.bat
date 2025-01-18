rmdir /S /Q dist

cd bootstrap
call pnpm build
cd ..\server
call pnpm build
cd ..\frontend
call pnpm build
cd ..

xcopy /I /E bootstrap\dist dist
copy bootstrap\scripts\*.* dist

xcopy /I /E server\dist dist\fancontrol
copy server\native\windows\*.dll dist\fancontrol

xcopy /I /E frontend\build dist\fancontrol\frontend

@REM Remove excess versions of native dependencies
cd dist\fancontrol\native\win32
rmdir /S /Q arm64
rmdir /S /Q ia32
cd x64
move 22 ..\
for /d %%i in (*) do rd /s /q "%%i"
move ..\22 .
cd ..\..\..\..\..\

@REM Add default config and package.json
copy alfc.config.json dist
copy package.json dist

cd dist
powershell Compress-Archive * alfc-without-node.zip
move alfc-without-node.zip ..\alfc-without-node.zip
curl -L --output node.exe https://nodejs.org/dist/v22.11.0/win-x64/node.exe
powershell Compress-Archive * alfc.zip
move ..\alfc-without-node.zip alfc-without-node.zip

cd ..
