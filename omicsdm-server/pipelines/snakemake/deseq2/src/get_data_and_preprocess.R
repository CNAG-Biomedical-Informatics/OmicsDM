print("---R-logs---")
print("start get_data_and_preprocess.R")
print("start loading libs")
libs <- c("httr", "dplyr", "stringr", "jsonlite", "paws")
for (lib in libs) {
  print(lib)
  suppressPackageStartupMessages(library(lib, character.only = TRUE))
}
print("libs loaded")

# https://github.com/Bioconductor/GenomicDataCommons/issues/35#issuecomment-284096739
# set_config(config(ssl_verifypeer = 0L, ssl_verifyhost = 0L, verbose = F))
set_config(httr::config(ssl_verifypeer = 0L, ssl_verifyhost = 0L, verbose = F))

# set_config(config(cainfo="/home/certs/vm2rootCA.pem",verbose=T))

# might be that it is not able to find the .Renviron file
readRenviron(".Renviron")
bucket <- Sys.getenv("BUCKET_NAME")

script_options <- fromJSON("analysis_options.json")
file_paths <- script_options$file_paths

filename <- file_paths[grep("COUNTS", file_paths)]
filename2 <- file_paths[grep("info_", file_paths)]
print(filename)
print(filename2)

s3 <- paws::s3(
  config = list(
    credentials = list(
      creds = list(
        access_key_id = "admin",
        secret_access_key = "12345678"
      )
    ),
    endpoint = "https://minio.omicsdm.cnag.dev",
    s3_force_path_style = TRUE,
    region = "us-east-1"
  )
)

# bucketlist <- s3$list_buckets()
# print("bucketlist")
# print(bucketlist)

print("objects")
print(s3$list_objects(Bucket = bucket))

# print(s3$list_objects(Bucket = bucket))

# options("cloudyr.aws.default_region" = "")
# bucketlist()

# Sys.setenv(AWS_DEFAULT_REGION = "")
# Sys.setenv(AWS_S3_ENDPOINT = "omicsdm.cnag.dev/bucketdevelomicsdm")
# options("cloudyr.aws.default_region" = "")
# bucketlist(use_https = T)

# print("s3_download")
# print(s3_download)

print("start get_object")
# object_exists(filename, bucket, region = "", use_https = T)

obj <- s3$get_object(Bucket = bucket, Key = filename)
# print("obj")
# print(obj)
# obj <- get_object(filename, bucket, region = "", use_https = T)
res1 <- read.csv(text = rawToChar(obj$Body))

# object_exists(filename, bucket, region = "", use_https = T)
obj2 <- s3$get_object(Bucket = bucket, Key = filename2)
# obj2 <- get_object(filename2, bucket, region = "", use_https = T)
res2 <- read.csv(text = rawToChar(obj2$Body))

new_colnames <- unlist(strsplit(colnames(res1)[3], "[.]"))
res1 <- tidyr::separate(
  data = res1,
  col = colnames(res1)[3],
  sep = " ",
  into = new_colnames,
  remove = TRUE
)
rownames(res1) <- res1$id_gene
res1$id_gene <- NULL

new_colnames <- unlist(strsplit(colnames(res2)[1], "[.]"))
res2 <- tidyr::separate(
  data = res2,
  col = colnames(res2)[1],
  sep = " ",
  into = new_colnames,
  remove = TRUE
)
rownames(res2) <- res2$BARCDODE
res2$BARCDODE <- NULL

print("resource1")
head(res1)
print("resource2")
head(res2)

saveRDS(res1, "out/rds/deseq2_obj1.rds")
saveRDS(res2, "out/rds/deseq2_obj2.rds")
