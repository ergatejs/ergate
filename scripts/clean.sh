#! /usr/bin/env bash

rimraf -f index.{js,d.ts,d.ts.map} {lib,test,bin,command}/**/*.{js,d.ts,d.ts.map};
