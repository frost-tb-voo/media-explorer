
import json
import os
import glob

directory = os.path.dirname(__file__)
directory = '/home'



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
imgs = filter(lambda f:f.endswith('.gif'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.bmp'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.flv'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.swf'), target_files)
files.extend(imgs)
imgs = filter(lambda f:f.endswith('.mp4'), target_files)
files.extend(imgs)

print(json.dumps(files, sort_keys=True, indent=2))


from PIL import Image

directories = []
directoriesmap = {}


count = 0
for file in files:
    count = count + 1
    # print(file)
    
    width, height = 0, 0
    if (file.endswith('.jpg') or file.endswith('.png') or file.endswith('.gif') or file.endswith('.bmp')):
        try:
            with Image.open(file) as img:
                width, height = img.size
        except OSError as err:
            print("{0}".format(err))

    directory, name = os.path.split(file)
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

#print(json.dumps(directories, sort_keys=True, indent=2))
fw = open('../view/images.json','w')
json.dump(directories, fw, indent=4)
