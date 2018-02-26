#!/bin/bash

rm -rf ./build
rm -rf ./src/contracts
truffle migrate --reset
cp -r ./build/contracts ./src
npm start
