#!/bin/bash

XVFB_PID=$(ps -ef | grep Xvfb | grep -v grep | awk '{print $2}')
if [ -z "$XVFB_PID" ]; then
    echo "Xvfb is not running. Starting Xvfb"
    Xvfb :20 -screen 0 1920x1080x16 &
fi

sleep 1
x11vnc -display :20 -N -forever -bg -o "/tmp/x11vnc.log"
echo "x11vnc started"
sleep 1
DISPLAY=:20 fluxbox -log /tmp/fluxbox.log &
echo "fluxbox started"
wait
