#!/bin/sh

DIR=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)
TARGET=/home

echo Now mounting ${TARGET} volume to the analysis container..

sudo -E docker run --rm -it \
 -v ${TARGET}:${TARGET}:rw \
 -v ${DIR}/fileanalysis:/fileanalysis:rw \
 -v ${DIR}/view:/view:rw \
 -w /fileanalysis \
 python:2.7.16 \
 ./run-media-indexer.sh

sudo -E docker run --rm -it \
 -v ${DIR}/fileanalysis:/fileanalysis:rw \
 -v ${DIR}/view:/view:rw \
 -w /view \
 python:2.7.16 \
 ../fileanalysis/meta-indexer.py

