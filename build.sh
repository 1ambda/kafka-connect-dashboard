#!/bin/bash

# SET VAR
PROG_MV=$(which mv)
PROG_RM=$(which rm)
PROG_MKDIR=$(which mkdir)

PROG_UNZIP=$(which unzip)
PROG_ZIP=$(which zip)

PROG_SBT=$(which sbt)
PROG_NPM=$(which npm)

ROOT_DIR=$PWD
DIST_DIR=$ROOT_DIR/dist
DIST_STORAGE_DIR=$DIST_DIR/storage

TAG="[KAFKALOT_SCRIPT]"

# GET SCRIPT PARAM
if [ "$#" -ne 1 ]; then
    echo -e "\n${TAG} Invalid Arguments. Usage: ./build.sh VERSION_NO\n" >&2; exit 1
fi
VERSION_NO=$1

# REMOVE DIST DIR
echo -e "${TAG} Initialize dist directory\n"
$PROG_RM -rf $DIST_DIR
$PROG_MKDIR $DIST_DIR

# RUN BUILD: kafkalot-storage
echo -e "${TAG} Building kafkalot-storage\n"
cd $ROOT_DIR
$PROG_SBT "project kafkalot-storage" "test" "universal:packageBin"

cd $DIST_STORAGE_DIR
$PROG_UNZIP *.zip       # unzip
$PROG_RM -rf tmp *.zip  # remove tmp files

# ZIP RESULT
RELEASE_NAME=kafkalot-${VERSION_NO}
echo -e "${TAG} Creating ${RELEASE_NAME}\n"
cd $DIST_DIR

$PROG_MKDIR $RELEASE_NAME
$PROG_MV storage $RELEASE_NAME
$PROG_ZIP -r $RELEASE_NAME.zip $RELEASE_NAME

