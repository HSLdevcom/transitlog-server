#!/bin/bash

set -e

ORG=${ORG:-hsldevcom}

read -p "Version: v" TAG

VERSION_TAG=v${TAG}
DOCKER_IMAGE=$ORG/transitlog-server:${VERSION_TAG}

docker build -t $DOCKER_IMAGE .
docker push $DOCKER_IMAGE

git tag $VERSION_TAG
git push --tags
