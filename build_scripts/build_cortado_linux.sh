#!/bin/sh

cd ./../src/backend
pip install -r requirements.txt
python3 -O -m PyInstaller --noconfirm --clean cortado-backend.spec
cp -r ./dist/cortado-backend ./../frontend/cortado-backend

cd ./../frontend
npm install
npm run electron-builder-app-production-linux
cp -r ./cortado-backend ./app-dist/linux-unpacked
rm -r -f ./cortado-backend
