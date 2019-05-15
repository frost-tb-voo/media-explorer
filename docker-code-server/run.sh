#!/bin/sh

IMAGE=codercom/code-server:1.408-vsc1.32.0
S_DIR=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)
DIR=${S_DIR}/..
ABS_DIR=`readlink -f ${DIR}`
UID=`id -u ${USER}`
GID=`id -g ${USER}`

echo open :8443
sudo -E docker pull ${IMAGE}
sudo -E docker stop vscode
sudo -E docker rm vscode
sudo -E docker run --name=vscode --net=host -d \
 -v "${ABS_DIR}/.local:/root/.local" \
 -v "${ABS_DIR}:/root/project" \
 codercom/code-server \
 code-server \
 --allow-http --no-auth

