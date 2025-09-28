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
filetype_to_filename <- script_options$filetype_to_filename

# get the filename of the count file
counts_filename <- filetype_to_filename[["counts"]]
info_filename <- filetype_to_filename[["info"]]

counts_filepath <- file_paths[grep(counts_filename, file_paths)]
info_filepath <- file_paths[grep(info_filename, file_paths)]
print(paste0("counts_filepath: ", counts_filepath))
print(paste0("info_filepath: ", info_filepath))

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

print("start get_object")

counts_obj <- s3$get_object(Bucket = bucket, Key = counts_filepath)
counts_tbl <- read.csv(text = rawToChar(counts_obj$Body), sep=" ")

# Anna Esteve 
# counts_tbl <- read.csv(text = rawToChar(counts_obj$Body))
print("got counts file")

info_obj <- s3$get_object(Bucket = bucket, Key = info_filepath)
info_tbl <- read.csv(text = rawToChar(info_obj$Body), sep=" ")

# Anna Esteve 
# info_tbl <- read.csv(text = rawToChar(info_obj$Body))

print("got info file")

print("counts_tbl")
print("colnames(counts_tbl)")
print(colnames(counts_tbl))
print(colnames(counts_tbl)[1])

new_colnames <- unlist(strsplit(colnames(counts_tbl)[3], "[.]"))
print("new_colnames")
print(new_colnames)

counts_df <- tidyr::separate(
  data = counts_tbl,
  col = colnames(counts_tbl)[3],
  sep = " ",
  into = new_colnames,
  remove = TRUE
)
# counts_df <- counts_tbl
# rownames(counts_df) <- counts_df$id_gene
# counts_df$id_gene <- NULL

counts_df <- counts_tbl
rownames(counts_df) <- counts_df$gene_id
counts_df$gene_id <- NULL

new_colnames <- unlist(strsplit(colnames(info_tbl)[1], "[.]"))
info_df <- tidyr::separate(
  data = info_tbl,
  col = colnames(info_tbl)[1],
  sep = " ",
  into = new_colnames,
  remove = TRUE
)
info_df <- info_tbl
colnames(info_df) <- toupper(colnames(info_df))
# drop the columns AGE and GENDER if they exist
if ("AGE" %in% colnames(info_df)) {
  info_df$AGE <- NULL
}
if ("GENDER" %in% colnames(info_df)) {
  info_df$GENDER <- NULL
}

# fix the typo in the example file from Anna Esteve
# rownames(info_df) <- info_df$BARCDODE
# info_df$BARCDODE <- NULL

rownames(info_df) <- info_df$BARCODE
info_df$BARCODE <- NULL

print("resource1")
head(counts_df)
print("resource2")
head(info_df)

saveRDS(counts_df, "out/rds/deseq2_obj1.rds")
saveRDS(info_df, "out/rds/deseq2_obj2.rds")

# rownames(info_tbl) <- info_tbl$BARCDODE
# info_tbl$BARCDODE <- NULL

# print(head(counts_tbl))
# print(head(info_tbl))

# saveRDS(counts_tbl, "out/rds/deseq2_obj1.rds")
# saveRDS(info_tbl, "out/rds/deseq2_obj2.rds")