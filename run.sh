
DIR=`pwd`
TARGET=/home

docker run --rm -it \
 -v ${DIR}/fileanalysis:/fileanalysis:rw \
 -v ${DIR}/view:/view:rw \
 -v ${TARGET}:${TARGET}:ro \
 -w /fileanalysis \
 python:3.5.4 \
 bash
