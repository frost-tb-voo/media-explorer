
import sys
import json
import os
import glob
import traceback

directory = os.path.dirname(__file__)
directory = 'C:/'
directory = '/home'


DEFAULT_ENCODING='utf8'
MIN_WIDTH = 400
MIN_WIDTH = 800
MIN_HEIGHT = MIN_WIDTH
# METHOD:
#     0: Correlation
#     1: Chi-square
#     2: Intersection
#     3: Bhattacharyya distance
METHOD=3
# THRESHOLD:
#     estimated THRESHOLD
#     METHOD = 0 -> 0.88 ~ 1 (Default is 0.9)
#     METHOD = 1 -> 80000 ~ 120000 (Default is 100000)
#     METHOD = 2 -> 1200000 ~ 2000000 (Default is 1600000)
#     METHOD = 3 -> 0.05 ~ 0.2 (Default is 0.15)
#THRESHOLD=0.15
THRESHOLD=0.07


root_dir = os.path.abspath(directory)

target_files = []
for root, dirs, files in os.walk(root_dir):
    targets = [os.path.join(root, f) for f in files]
    target_files.extend(targets)

# print(json.dumps(target_files, sort_keys=True, indent=2))


files = []
imgs = filter(lambda f:f.endswith('.jpg'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.png'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.bmp'), target_files)
files.extend(imgs)

# print(json.dumps(files, sort_keys=True, indent=2))

imgs = filter(lambda f:f.endswith('.gif'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.flv'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.swf'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.mp4'), target_files)
files.extend(imgs)


from PIL import Image

directories = []
directoriesmap = {}
fids = {}

count = 0
for file in files:
    count = count + 1
    try:
        width, height = 0, 0
        if (file.endswith('.jpg') or file.endswith('.png') or file.endswith('.gif') or file.endswith('.bmp')):
            with Image.open(file) as img:
                width, height = img.size

        file = unicode(file, DEFAULT_ENCODING)
        directory, name = os.path.split(file)
        directory = directory.replace('\\\\', '/').replace('\\', '/')
        title, ext = os.path.splitext(name)
        image = {"name":name, "ext":ext, "directory":directory, "width":width, "height":height}

        if directory not in directoriesmap:
            directoriesmap[directory] = {}
            dirobj = directoriesmap[directory]
            dirobj["directory"] = directory
            dirobj["images"] = []
            directories.append(dirobj)
        
            message = str(count) + '/' + str(len(files))
            print(message)
    
        dirobj = directoriesmap[directory]
        dirobj["images"].append(image)

        if file not in fids:
            fids[file] = image
            image['fid'] = 'fid-' + str(len(fids))
    
    except BaseException as err:
        print("{0}".format(err))
        print(file)
        print(str(type(file)))
        print(traceback.format_exc())


_files = []

for _file in files:
    try:
        file = unicode(_file, DEFAULT_ENCODING)
        width, height = fids[file]['width'], fids[file]['height']
        if width > MIN_WIDTH and height > MIN_HEIGHT:
            _files.append(_file)
    except BaseException as err:
        print("{0}".format(err))

# print(json.dumps(_files, sort_keys=True, indent=2))


from sys import argv
from glob import glob
from itertools import combinations

import cv2

if len(_files) > 0:
    cv2.imread(_files[0])
    print('cv2.imread succeeded!')

image_hists = dict()

count = 0
for picture in _files:
    count = count + 1
    message = str(count) + '/' + str(len(files))
    if count % 10 == 0:
        print(message)

    im = cv2.imread(picture)
    image_hists[picture] = cv2.calcHist([im], [0], None, [256], [0, 256])

combinations_len = 0
for pictA, pictB in combinations(_files, 2):
    combinations_len = combinations_len + 1

count = 0
for pictA, pictB in combinations(_files, 2):
    count = count + 1
    try:
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
            pictA = unicode(pictA, DEFAULT_ENCODING)
            pictB = unicode(pictB, DEFAULT_ENCODING)

            similarity1 = {}
            similarity1["fid"] = fids[pictA]['fid']
            similarity1["value"] = result
            if 'similarities' not in fids[pictB]:
                fids[pictB]['similarities'] = []
            fids[pictB]['similarities'].append(similarity1)

            similarity2 = {}
            similarity2["fid"] = fids[pictB]['fid']
            similarity2["value"] = result
            if 'similarities' not in fids[pictA]:
                fids[pictA]['similarities'] = []
            fids[pictA]['similarities'].append(similarity2)

            message = 'Calc similarity ' + str(count) + '/' + str(combinations_len)
            print(message)

    except BaseException as err:
        print("{0}".format(err))
        print(pictA)
        print(str(type(pictA)))
        print(pictB)
        print(str(type(pictB)))
        print(traceback.format_exc())


#print(json.dumps(directories, sort_keys=True, indent=2))
fw = open('./view/images.json','w')
json.dump(directories, fw, indent=1)

