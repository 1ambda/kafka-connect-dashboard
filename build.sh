#!/bin/bash

# SET VAR
PROG_SBT=$(which sbt)
PROG_UNZIP=$(which unzip)
PROG_RM=$(which rm)
PROG_NPM=$(which npm)

ROOT_DIR=$PWD
DIST_STORAGE_DIR=$ROOT_DIR/dist/storage

# RUN BUILD: kafkalot-storage
cd $ROOT_DIR
$PROG_SBT "project kafkalot-storage" "test" "universal:packageBin"

cd $DIST_STORAGE_DIR
$PROG_UNZIP *.zip       # unzip
$PROG_RM -rf tmp *.zip  # remove tmp files

# RUN BUILD: kafkalot-ui
cd $ROOT_DIR/kafkalot-ui
$PROG_NPM run build
