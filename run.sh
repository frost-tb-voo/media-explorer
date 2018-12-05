#!/bin/sh

DIR=`pwd`
TARGET=/home

sudo -E docker run --rm -it \
 -v ${DIR}/fileanalysis:/fileanalysis:rw \
 -v ${DIR}/view:/view:rw \
 -v ${TARGET}:${TARGET}:ro \
 -w /fileanalysis \
 python:2.7.14 \
 ./run-media-indexer.sh

