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

analysis_id=$(jq -r '.analysis_id' analysis_options.json)
bases_on=$(jq -r '.bases_on' analysis_options.json)
echo "analysis_id: $analysis_id"
echo "bases_on: $bases_on"

key="${analysis_id}/${bases_on}/results.tar.gz"
echo "S3 key to download: $key"

aws "${AWS_OPTS[@]}" \
    "s3://$S3_BUCKET/$key" \
    "$DOWNLOAD_DIR/results.tar.gz"

declare -A files=(
  [h5ad]="data.h5ad"
  [gmt]="modules.gmt"
)

for ext in "${!files[@]}"; do
  # pick out the matching path from JSON
  infile=$(
    jq -r --arg pat "\\.${ext}\$" \
      '.file_paths[] | select(test($pat))' \
      analysis_options.json
  )

  echo "${ext^^} → [$infile]"

  # download
  aws "${AWS_OPTS[@]}" \
    "s3://$S3_BUCKET/$infile" \
    "$DOWNLOAD_DIR/${files[$ext]}"

  module_file="$DOWNLOAD_DIR/${files[$ext]}"
done

if [ $? -ne 0 ]; then
    echo "Error downloading the file from S3"
    exit 1
fi

tar -xzvf in/results.tar.gz \
    --directory in \
    --wildcards '*.h5ad' \
    --strip-components=2

# get the name of the downloaded file
downloaded_file=$(find in -name "*.h5ad" | head -n 1)
mv "$downloaded_file" "in/data.h5ad"
mv "$module_file" "in/modules.gmt"

rm in/results.tar.gz
