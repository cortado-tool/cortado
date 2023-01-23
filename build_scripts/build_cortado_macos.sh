#!/bin/sh

cd ./../src/backend
pip3 install -r requirements.txt
pip3 uninstall -y cvxopt
pip3 uninstall -y pm4pycvxopt
python3 -O -m PyInstaller --noconfirm --clean cortado-backend-macos.spec
cp -r ./dist/cortado-backend ./../frontend/cortado-backend

cd ./../frontend
npm install
npm run electron-builder-app-production-macos
rm -r -f ./cortado-backend
open ./app-dist