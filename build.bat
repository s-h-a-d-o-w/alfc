@echo off
call pnpm rimraf dist || exit /b

call pnpm build || exit /b

xcopy /I /E bootstrap\dist dist || exit /b
copy bootstrap\scripts\*.* dist || exit /b

xcopy /I /E server\dist dist\fancontrol || exit /b
copy server\native\windows\*.dll dist\fancontrol || exit /b

xcopy /I /E frontend\build dist\fancontrol\frontend || exit /b

@REM Remove excess versions of native dependencies
cd dist\fancontrol\native\win32 || exit /b
rmdir /S /Q arm64 || exit /b
rmdir /S /Q ia32 || exit /b
cd x64 || exit /b
move 22 ..\ || exit /b
for /d %%i in (*) do rd /s /q "%%i" || exit /b
move ..\22 . || exit /b
cd ..\..\..\..\..\ || exit /b

@REM Add default config and package.json
copy alfc.config.json dist || exit /b
copy package.json dist || exit /b

cd dist || exit /b
powershell Compress-Archive * alfc-without-node.zip || exit /b
move alfc-without-node.zip ..\alfc-without-node.zip || exit /b
curl -L --output node.exe https://nodejs.org/dist/v22.11.0/win-x64/node.exe || exit /b
powershell Compress-Archive * alfc.zip || exit /b
move ..\alfc-without-node.zip alfc-without-node.zip || exit /b

cd .. || exit /b