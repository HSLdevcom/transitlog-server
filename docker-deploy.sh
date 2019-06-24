#!/bin/bash

set -e

ORG=${ORG:-hsldevcom}
DOCKER_TAG=latest
DOCKER_IMAGE=$ORG/transitlog-server:${DOCKER_TAG}
DOCKER_IMAGE_LATEST=$ORG/transitlog-server:latest

docker build -t $DOCKER_IMAGE .

docker tag $DOCKER_IMAGE $DOCKER_IMAGE_LATEST
docker push $DOCKER_IMAGE_LATEST
