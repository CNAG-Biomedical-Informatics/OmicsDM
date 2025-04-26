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
# save_object(object = "3tr_jfojf3p3332t/fgsea/results.tar.gz", bucket = "bucketdevel3tropal", file="in/results.tar.gz")

cmd <- "tar -xzvf in/results.tar.gz --directory in --wildcards 'out/results/*_results.txt' --strip-components=2"
system(cmd)

file_paths <- script_options$file_paths
print("file_paths")
print(file_paths)
reactome_identifier_mapping_file <- script_options$use_reactome_identifier_mapping_file
print(reactome_identifier_mapping_file)
out_dir <- "out/tmp/"

# check if the use_reactome_identifier_mapping_file is null
if (is.null(reactome_identifier_mapping_file)) {
  print("reactome_identifier_mapping_file is null")
  gmt_file <- file_paths[grep(".gmt", file_paths)]
  print(gmt_file)

  splitted <- strsplit(gmt_file, "/")[[1]]
  target_string <- splitted[length(splitted)]
  gmt_filename <- sub("_uploadedVersion_1.gmt", "", target_string)

  # hardcode the gmt file
  # gmt_file <- "3tr/test/c2.cp.kegg_medicus.v2023.2.Hs.symbols.gmt_uploadedVersion_1.gmt"

  object_exists(gmt_file, bucket, region = "", use_https = FALSE)
  obj <- get_object(gmt_file, bucket, region = "", use_https = FALSE)

  out_path <- paste0("out/tmp/", gmt_filename)
  writeLines(rawToChar(obj), out_path)

  # save_object(
  #   object = gmt_filename,
  #   bucket = bucket,
  #   file = paste0(out_dir, gmt_file),
  #   region = "",
  #   use_https = FALSE
  # )
} else {
  print("reactome_identifier_mapping_file is not null")


  base <- "https://reactome.org/download/current/"
  # target <- "Ensembl2Reactome_All_Levels.txt"
  # target <- paste0(use_reactome_identifier_mapping_file,".txt")

  out_path <- paste0("out/tmp/", reactome_identifier_mapping_file)
  url <- paste0(base, reactome_identifier_mapping_file)
  print("url")
  print(url)

  cmd <- paste0("curl ", url, " > ", out_path)
  print("cmd")
  print(cmd)
  system(cmd)

  library("tidyverse")

  header <- c("X1", "X2", "X3", "X4", "X5", "X6")
  res1 <- read_tsv(out_path)

  first_row <- names(res1)
  names(res1) <- header
  names(first_row) <- header

  res1 %>%
    # add the former header back to the tibble
    bind_rows(first_row) %>%
    filter(X6 == "Homo sapiens") %>%
    select(c(X1, X4)) %>%
    mutate(X4 = str_replace_all(X4, " ", "_")) %>%
    group_by(X4) %>%
    summarise(ids = paste(X1, collapse = "\t")) %>%
    unite(result, X4, ids, sep = "\t") %>%
    pull(result) %>%
    write_lines("out/tmp/reactome_gmt.tsv")
}

print("end get_data.R")
