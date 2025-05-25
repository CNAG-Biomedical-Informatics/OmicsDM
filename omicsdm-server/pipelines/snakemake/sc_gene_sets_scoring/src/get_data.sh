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

# map of extension → local output name
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
done