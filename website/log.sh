#!/bin/bash

touch log

while [ 1 ] ; do
	grep "Cookie :" ~/.config/chromium/chrome_debug.log > tmp
	(diff log tmp) > /dev/null
	echo "TMP:"
	cat tmp
	if [ $? -eq 1 ]; then
		cat tmp > log
	fi
done
