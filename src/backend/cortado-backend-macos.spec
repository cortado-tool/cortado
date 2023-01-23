# -*- mode: python ; coding: utf-8 -*-
block_cipher = None

import sys
import glob
sys.setrecursionlimit(sys.getrecursionlimit() * 5)

# https://stackoverflow.com/a/48068640
import importlib

datas = []
if glob.glob('./resources/*.p'):
    print('Adding Resources')
    datas.append(( './resources/*.p', 'resources' ))

if glob.glob('./*.ini'):
    datas.append(( './*.ini', '.' ))

cwd = os.getcwd()
a = Analysis(['main.py'],
             pathex=[cwd],
             hiddenimports=['uvicorn.logging',
                            'uvicorn.loops',
                            'uvicorn.loops.auto',
                            'uvicorn.protocols',
                            'uvicorn.protocols.http',
                            'uvicorn.protocols.http.auto',
                            'uvicorn.protocols.websockets',
                            'uvicorn.protocols.websockets.auto',
                            'uvicorn.lifespan',
                            'uvicorn.lifespan.on',
                            'OpenBLAS',
                            'sklearn.neighbors._partition_nodes',
                            'encodings',
                            'main'],
             binaries=[],
             datas=datas,
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='cortado-backend',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=True,
          icon=os.path.join(os.path.dirname(SPEC), 'icon', 'cortado_icon_colorful_transparent.ico'))
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='cortado-backend')
app = BUNDLE(exe,
         name='cortado-backend.app',
         icon=None,
         bundle_identifier=None)
