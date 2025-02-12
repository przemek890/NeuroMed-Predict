#!/bin/sh
if echo "$REACT_APP_DOMAIN" | grep -q "^https://"; then
    echo "window.REACT_APP_DOMAIN='$REACT_APP_DOMAIN';" > ./build/runtime-env.js
else
    if [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup; then
        echo "window.REACT_APP_DOMAIN='$REACT_APP_DOMAIN';" > ./build/runtime-env.js
    else
        echo "window.REACT_APP_DOMAIN='$REACT_APP_DOMAIN';" > ./public/runtime-env.js
    fi
fi
echo "Gateway application domain: $REACT_APP_DOMAIN"
