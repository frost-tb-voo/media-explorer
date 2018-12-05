#!/bin/sh

#TARGET=/home/titan-user/downloads
TARGET1=/mnt/sdb1fs
TARGET2=/mnt/sdc1fs
TARGET="${TARGET1} ${TARGET2}"

pip install pip-tools==1.9.0
pip-compile requirements.in
pip install -r requirements.txt

python ./media-indexer.py -d ${TARGET} -o ../view/images.json

