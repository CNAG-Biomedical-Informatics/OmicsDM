Snake make pipeline for Single Cell gene sets scoring

first check if the data expected data is available on the ceph S3
2nd get the data from the S3 and preprocess it
use getEnv from JSON to get the environment variables for the pipeline

run the pipeline
generate the report based on the output of the pipeline

Note: currently only the GSVA and Z-scores are implemented for single cell RNA-seq data
ask Charisios if the GSVA and the Z-scores
could also be used for bulk RNA-seq data?
