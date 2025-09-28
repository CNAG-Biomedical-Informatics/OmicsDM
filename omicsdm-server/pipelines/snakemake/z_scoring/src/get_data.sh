#!/bin/bash

# Define the S3 bucket and the directory to download to
ENDPOINT="https://minio.omicsdm.cnag.dev"
S3_BUCKET="bucketdevelomicsdm"
DOWNLOAD_DIR="in"

mkdir -p $DOWNLOAD_DIR

# common aws options
# AWS_OPTS=(--ca-bundle /home/certs/vm3rootCA.pem --endpoint-url "$ENDPOINT" s3 cp)
AWS_OPTS=(--no-verify-ssl --endpoint-url "$ENDPOINT" s3 cp)
echo $AWS_OPTS

jq -r '.file_paths[]' analysis_options.json | while read -r infile; do
  echo "Downloading [$infile] ..."
  aws "${AWS_OPTS[@]}" \
    "s3://$S3_BUCKET/$infile" \
    "$DOWNLOAD_DIR/$(basename "$infile")"
done

if [ $? -ne 0 ]; then
    echo "Error downloading the file from S3"
    exit 1
fi

# find the gmt file in the downloaded files
module_file=$(find in -name "*.gmt" | head -n 1)
if [ -z "$module_file" ]; then
    echo "No .gmt file found in the downloaded files"
    exit 1
fi
echo "Found module file: $module_file"
mv "$module_file" "in/modules.gmt"

# find the h5ad file in the downloaded files
h5ad_file=$(find in -name "*.h5ad" | head -n 1)
if [ -z "$h5ad_file" ]; then
    echo "No .h5ad file found in the downloaded files"
    exit 1
fi
echo "Found h5ad file: $h5ad_file"
mv "$h5ad_file" "in/original.h5ad"

# download the results.tar.gz from the previous analysis
analysis_id=$(jq -r '.analysis_id' analysis_options.json)
bases_on=$(jq -r '.bases_on' analysis_options.json)
echo "analysis_id: $analysis_id"
echo "bases_on: $bases_on"

key="${analysis_id}/${bases_on}/results.tar.gz"
echo "S3 key to download: $key"

aws "${AWS_OPTS[@]}" \
    "s3://$S3_BUCKET/$key" \
    "$DOWNLOAD_DIR/results.tar.gz"

tar -xzvf in/results.tar.gz \
    --directory in \
    --wildcards '*.h5ad' \
    --strip-components=2

# get the name of the downloaded file
# downloaded_file=$(find in -name "*.h5ad" | head -n 1)
# mv "$downloaded_file" "in/normalised.h5ad"

rm in/results.tar.gz
