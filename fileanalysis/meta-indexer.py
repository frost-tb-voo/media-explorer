#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import os
import traceback

targetDir = '.'
targetFiles = []
for root, dirs, files in os.walk(os.path.abspath(targetDir)):
    targets = [os.path.join(root, f) for f in files]
    for targetFile in targets:
        directory, name = os.path.split(targetFile)
        if not name.endswith('.json'):
            continue
        if not name.startswith('images'):
            continue
        targetFiles.append(name)

# subprocess.run(['cp', 'react-json-template.jsx', 'react-json.jsx'])
os.system('cp react-json-template.jsx react-json.jsx')

metaPath = ''
with open('react-json.jsx', 'a') as fw:
    for targetFile in targetFiles:
        fw.write('jsonFileList.push("./' + targetFile + '");\n')


