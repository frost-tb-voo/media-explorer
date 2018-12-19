#!/bin/sh

TARGET=/home

pip install pip-tools==1.9.0
pip-compile requirements.in
pip install -r requirements.txt

python ./media-indexer.py -d ${TARGET} -o ../view/images.json -c ../view/checksums.csv

