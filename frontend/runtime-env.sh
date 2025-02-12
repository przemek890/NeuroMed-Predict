#!/bin/sh

echo "window.REACT_APP_DOMAIN='$REACT_APP_DOMAIN';" > ./build/runtime-env.js
echo "Gateway application domain: $REACT_APP_DOMAIN"
