# PLEASE NOTE:
# run with admin rights and make sure the correct venv of python is activated

Write-Output Get-Location
$originalPath = (Get-Item .).FullName

Write-Output "BUILD BACKEND"
cd ./../src/backend
pip install -r requirements.txt
python -O -m PyInstaller --noconfirm --clean cortado-backend.spec

Write-Output "BUILD FRONTEND"
cd ./../frontend
npm install
Remove-Item -Recurse ./app-dist/
npm run electron-builder-app-production-windows
Get-Location

Write-Output "COPY FILES"
cd ./../backend/
Remove-Item -Recurse ./../frontend/app-dist/win-unpacked/cortado-backend/
New-Item -ItemType Directory -Path ./../frontend/app-dist/win-unpacked/cortado-backend/
Copy-Item -Path ./dist/cortado-backend/* -Destination ./../frontend/app-dist/win-unpacked/cortado-backend/ -Recurse

Write-Output "OPEN WINDOWS EXPLORER"
Invoke-Item ./../frontend/app-dist/win-unpacked

Write-Output "RESET PATH"
cd $originalPath