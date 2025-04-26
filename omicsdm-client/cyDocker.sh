#!/bin/bash

XVFB_PID=$(ps -ef | grep Xvfb | grep -v grep | awk '{print $2}')
if [ -z "$XVFB_PID" ]; then
    echo "Xvfb is not running. Starting Xvfb"
    Xvfb :99 &
fi

DOCKER_PRESENT=$(docker ps -a | grep cy-docker)
if [ "$DOCKER_PRESENT" ]; then
    echo "removing existing cy-docker"
    docker rm -f "$(docker ps -aqf "name=cy-docker")"
fi

# restart client to make sure that the correct config is used
echo "starting client"
npx kill-port 5000
webpack serve --open --config webpack.cy.js&

echo "Starting cy-docker"
docker run -itd --network=host --name cy-docker -v $PWD:/cy -w /cy --entrypoint sleep cypress/included:8.3.0 infinity
