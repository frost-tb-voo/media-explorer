#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import csv
import hashlib
import json
import os
import traceback
from argparse import ArgumentParser
from itertools import combinations

import cv2
import numpy
from PIL import Image

"""similarity analysis."""

#import glob


desc = u'{0} [Args] [Options]\nDetailed options -h or --help'.format(__file__)

parser = ArgumentParser(description=desc)

parser.add_argument(
    '-d', '--dir',
    type=str,  # int, bool
    dest='directories',
    default=['/home'],
    nargs='*',
    required=True,
    help='analyzing directory path'
)
parser.add_argument(
    '-o', '--output',
    type=str,  # int, bool
    dest='output',
    default='../view/images.json',
    required=True,
    help='output json path'
)
parser.add_argument(
    '-c', '--checksum',
    type=str,
    dest='checksum',
    default='../view/checksums.csv',
    required=True,
    help='output checksum list csv path'
)
parser.add_argument(
    '-s', '--similarity',
    type=bool,
    dest='similarity',
    default=False,
    help='calculate similarity'
)

args = parser.parse_args()
print (args)


targetDirList = [os.path.dirname(__file__)]
targetDirList = args.directories
outputPath = args.output
isCalcSimilarity = args.similarity
checksumPath = args.checksum


DEFAULT_ENCODING = 'utf8'
MIN_WIDTH = 400
MIN_WIDTH = 800
MIN_HEIGHT = MIN_WIDTH
# METHOD:
#     0: Correlation
#     1: Chi-square
#     2: Intersection
#     3: Bhattacharyya distance
METHOD = 3
# THRESHOLD:
#     estimated THRESHOLD
#     METHOD = 0 -> 0.88 ~ 1 (Default is 0.9)
#     METHOD = 1 -> 80000 ~ 120000 (Default is 100000)
#     METHOD = 2 -> 1200000 ~ 2000000 (Default is 1600000)
#     METHOD = 3 -> 0.05 ~ 0.2 (Default is 0.15)
# THRESHOLD=0.15
THRESHOLD = 0.07


with open(checksumPath, 'r') as fr:
    reader = csv.reader(fr, lineterminator='\n')
    # header = next(reader)
    for row in reader:
        checksum = row[0]
        directory = row[1]
        name = row[2]
        removal = row[4]
        if len(removal) > 0 and int(removal) > 0:
            file = directory + os.sep + name
            os.remove(file)


targetDirList = []

targetFiles = []
for targetDir in targetDirList:
    for root, dirs, files in os.walk(os.path.abspath(targetDir)):
        targets = [os.path.join(root, f) for f in files]
        targetFiles.extend(targets)

# print(json.dumps(targetFiles, sort_keys=True, indent=1))

files = []
imgs = filter(lambda f: f.endswith('.jpeg'), targetFiles)
files.extend(imgs)
imgs = filter(lambda f: f.endswith('.jpg'), targetFiles)
files.extend(imgs)
imgs = filter(lambda f: f.endswith('.png'), targetFiles)
files.extend(imgs)
imgs = filter(lambda f: f.endswith('.bmp'), targetFiles)
files.extend(imgs)
imgs = filter(lambda f: f.endswith('.gif'), targetFiles)
files.extend(imgs)
imgs = filter(lambda f: f.endswith('.flv'), targetFiles)
files.extend(imgs)
imgs = filter(lambda f: f.endswith('.swf'), targetFiles)
files.extend(imgs)
imgs = filter(lambda f: f.endswith('.mp4'), targetFiles)
files.extend(imgs)

# print(json.dumps(files, sort_keys=True, indent=1))


directories = []
directoriesmap = {}
fids = {}
sizesmap = {}

if os.path.exists(outputPath):
    print('Load ' + outputPath)
    with open(outputPath, 'r') as fr:
        directories = json.load(fr)

notExists = []
count = 0
for dirobj in directories:
    count += 1

    directory = dirobj['directory']
    if not os.path.exists(directory):
        notExists.append(dirobj)
        continue
    directoriesmap[directory] = dirobj

    imagesNotExists = []
    for image in dirobj['images']:
        file = directory + os.sep + image['name']
        if not os.path.exists(file):
            imagesNotExists.append(image)
            continue
        fids[file] = image
    for image in imagesNotExists:
        dirobj['images'].remove(image)

    if count % 100 == 0:
        percentage = round(100.0 * count / len(directories), 2)
        message = 're-indexing {p:0=4} %'.format(p=percentage)
        print(message)

for dirobj in notExists:
    directories.remove(dirobj)

for dirobj in directories:
    directory = dirobj['directory']

    for image in dirobj['images']:
        if 'size' not in image:
            file = directory + os.sep + image['name']
            image['size'] = os.path.getsize(file)
        size = image['size']
        if size not in sizesmap:
            sizesmap[size] = []
        sizesmap[size].append(image)

    for image in dirobj['images']:
        if 'similarities' in image:
            del image['similarities']

maxid = 0
for image in fids.values():
    if not 'fid' in image or not isinstance(image['fid'], int):
        continue
    if maxid < image['fid']:
        maxid = image['fid']
for image in fids.values():
    if not 'fid' in image or not isinstance(image['fid'], int):
        maxid += 1
        image['fid'] = maxid

for file in files:
    try:
        file = unicode(file, DEFAULT_ENCODING)
        if file in fids:
            continue

        directory, name = os.path.split(file)
        directory = directory.replace(os.sep, '/')
        title, ext = os.path.splitext(name)
        size = os.path.getsize(file)

        width, height = 0, 0
        if (file.endswith('.jpeg') or file.endswith('.jpg') or file.endswith(
                '.png') or file.endswith('.gif') or file.endswith('.bmp')):
            with Image.open(file) as img:
                width, height = img.size

        image = {'name': name, 'ext': ext, 'directory': directory,
                 'width': width, 'height': height, 'size': size}
        fids[file] = image
        maxid += 1
        image['fid'] = maxid

        if directory not in directoriesmap:
            directoriesmap[directory] = {}
            dirobj = directoriesmap[directory]
            dirobj['directory'] = directory
            dirobj['images'] = []
            directories.append(dirobj)

        dirobj = directoriesmap[directory]
        dirobj['images'].append(image)

        if size not in sizesmap:
            sizesmap[size] = []
        sizesmap[size].append(image)

        if len(fids) % 1000 == 0:
            percentage = round(100.0 * len(fids) / len(files), 2)
            message = 'indexing {p:0=4} %'.format(p=percentage)
            print(message)

    except BaseException as err:
        print('{0}'.format(err))
        print(file)
        # print(str(type(file)))
        # print(traceback.format_exc())
        print('')

for dirobj in directories:
    # dirobj['images'] = sorted(dirobj['images'])
    dirobj['images'].sort(key=lambda image: image['name'])

# print(json.dumps(directories, sort_keys=True, indent=1))
with open(outputPath, 'w') as fw:
    json.dump(directories, fw, indent=1)


rows = []
count = 0
for size in sizesmap:
    count += 1

    if len(sizesmap[size]) < 2:
        continue

    checksumsmap = {}
    for image in sizesmap[size]:
        file = image['directory'] + os.sep + image['name']
        # file = unicode(file, DEFAULT_ENCODING)

        sha1 = hashlib.sha1()
        with open(file, 'rb') as fr:
            for chunk in iter(lambda: fr.read(2048 * sha1.block_size), b''):
                sha1.update(chunk)
        checksum = sha1.hexdigest()

        if checksum not in checksumsmap:
            checksumsmap[checksum] = []
        checksumsmap[checksum].append(image)

    for checksum in checksumsmap:
        if len(checksumsmap[checksum]) < 2:
            continue

        for image in checksumsmap[checksum]:
            row = []
            rows.append(row)
            row.append(checksum)
            row.append(image['directory'].encode(DEFAULT_ENCODING))
            row.append(image['name'].encode(DEFAULT_ENCODING))

    if count % 100 == 0:
        percentage = round(100.0 * count / len(sizesmap), 2)
        message = 'calc checksum {p:0=4} %'.format(p=percentage)
        print(message)

with open(checksumPath, 'w') as fw:
    writer = csv.writer(fw, lineterminator='\n')
    writer.writerows(rows)

if not isCalcSimilarity:
    os._exit(0)


filesFiltered = []
for _file in files:
    try:
        file = unicode(_file, DEFAULT_ENCODING)
        width, height = fids[file]['width'], fids[file]['height']
        if width > MIN_WIDTH and height > MIN_HEIGHT:
            filesFiltered.append(file)
    except BaseException as err:
        print('{0}'.format(err))
# print(json.dumps(filesFiltered, sort_keys=True, indent=1))

if len(filesFiltered) > 0:
    stream = open(filesFiltered[0])
    bytes = bytearray(stream.read())
    numpyarray = numpy.asarray(bytes, dtype=numpy.uint8)
    cv2.imdecode(numpyarray, cv2.IMREAD_UNCHANGED)
    # cv2.imread(filesFiltered[0])
    print('cv2.imread succeeded!')

image_hists = dict()
for picture in filesFiltered:
    try:
        stream = open(picture)
        bytes = bytearray(stream.read())
        numpyarray = numpy.asarray(bytes, dtype=numpy.uint8)
        im = cv2.imdecode(numpyarray, cv2.IMREAD_UNCHANGED)
        # im = cv2.imread(picture)
        image_hists[picture] = cv2.calcHist([im], [0], None, [256], [0, 256])

        if len(image_hists) % 100 == 0:
            percentage = round(100.0 * len(image_hists) / len(files), 2)
            message = '{p:0=4} %'.format(p=percentage)
            print(message)
    except BaseException as err:
        print('{0}'.format(err))
        print(picture)

count = 0
combinations_len = 0
for pictA, pictB in combinations(filesFiltered, 2):
    combinations_len += 1

for pictA, pictB in combinations(filesFiltered, 2):
    count += 1
    try:
        if 'similarities' in fids[pictA]:
            is_similar = False
            for similarity in fids[pictA]['similarities']:
                is_similar = similarity['fid'] == fids[pictB]['fid']
            if is_similar:
                continue

        image_histA, image_histB = image_hists[pictA], image_hists[pictB]
        result = cv2.compareHist(image_histA, image_histB, METHOD)
        is_similar = False
        if METHOD in [1, 3]:
            if result < THRESHOLD:
                is_similar = True
        else:
            if result > THRESHOLD:
                is_similar = True
        if is_similar:
            similarity1 = {}
            similarity1['fid'] = fids[pictA]['fid']
            similarity1['value'] = result
            if 'similarities' not in fids[pictB]:
                fids[pictB]['similarities'] = []
            fids[pictB]['similarities'].append(similarity1)

            similarity2 = {}
            similarity2['fid'] = fids[pictB]['fid']
            similarity2['value'] = result
            if 'similarities' not in fids[pictA]:
                fids[pictA]['similarities'] = []
            fids[pictA]['similarities'].append(similarity2)

        if count % 100000 == 0:
            message = 'Calc similarity ' + \
                str(count) + '/' + str(combinations_len)
            print(message)

    except BaseException as err:
        print('{0}'.format(err))
        print(pictA)
        print(str(type(pictA)))
        print(pictB)
        print(str(type(pictB)))
        print(traceback.format_exc())

# for dirobj in directories:
#    dirobj['similarities'].sort(key=lambda similarity: similarity['value'])

# print(json.dumps(directories, sort_keys=True, indent=1))
with open(outputPath, 'w') as fw:
    json.dump(directories, fw, indent=1)
