#!/bin/bash

./log.sh&

chromium-browser --enable-logging --v=1 > /dev/null 2> /dev/null
