print("---R-logs---")
print("start get_data.R")
print("start loading libs")

# TODO
# Error in library(lib, character.only = TRUE) :
#   there is no package called ‘aws.s3’
# Calls: suppressPackageStartupMessages -> withCallingHandlers -> library
# Execution halted

# The aws.s3 needs to be installed using renv

libs <- c("aws.s3", "httr", "jsonlite")
for (lib in libs) {
  print(lib)
  suppressPackageStartupMessages(library(lib, character.only = TRUE))
}
print("libs loaded")

# https://github.com/Bioconductor/GenomicDataCommons/issues/35#issuecomment-284096739
set_config(config(ssl_verifypeer = 0L, ssl_verifyhost = 0L, verbose = F))
# set_config(config(cainfo="/home/certs/vm2rootCA.pem",verbose=T))

readRenviron(".Renviron")
bucket <- Sys.getenv("BUCKET_NAME")

script_options <- fromJSON("analysis_options.json")
print(script_options)

analysis_id <- script_options$analysis_id
print(analysis_id)

bases_on <- script_options$bases_on
print(bases_on)

file_path <- paste0(analysis_id, "/", bases_on, "/results.tar.gz")
print(file_path)

# get the analysis id from the analysis_options.json

object_exists(file_path, bucket, region = "", use_https = FALSE)
save_object(
  object = file_path,
  bucket = bucket,
  file = "in/results.tar.gz",
  region = "",
  use_https = FALSE
)

# TODO
# below should not be hardcoded
# object_exists("3tr_jfojf3p3332t/deseq2/results.tar.gz",bucket)
# save_object(object = "3tr_jfojf3p3332t/deseq2/results.tar.gz", bucket = bucket, file="in/results.tar.gz")

cmd <- "tar -xzvf in/results.tar.gz --directory in --wildcards 'out/results/*_results.txt' --strip-components=2"
system(cmd)

print("end get_data.R")
