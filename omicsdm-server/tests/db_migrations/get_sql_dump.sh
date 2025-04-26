#!/bin/sh
dir=$1

echo "change directory to ${dir}"
cd ${dir} && ls -l
echo $(pwd)

db_uri=$(cat config.py | grep SQLALCHEMY_DATABASE_URI | grep -o '"\(.*\)"')
echo ${db_uri}

pg_dump -d ${db_uri} -f dump.sql
