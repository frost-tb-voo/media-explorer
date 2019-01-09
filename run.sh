#!/bin/sh

DIR=`pwd`
#TARGET=/home
TARGET1=/mnt/sdb1fs
TARGET2=/mnt/sdc1fs

sudo -E docker run --rm -it \
 -v ${DIR}/fileanalysis:/fileanalysis:rw \
 -v ${DIR}/view:/view:rw \
 -v ${TARGET1}:${TARGET1}:rw \
 -v ${TARGET2}:${TARGET2}:rw \
 -w /fileanalysis \
 python:2.7.14 \
 ./run-media-indexer.sh

