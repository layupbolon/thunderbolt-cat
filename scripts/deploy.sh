#!/bin/bash

git pull
yarn build
pm2 restart aigc