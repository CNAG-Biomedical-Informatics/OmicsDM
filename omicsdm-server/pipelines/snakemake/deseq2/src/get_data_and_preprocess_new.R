print("---R-logs---")
print("start data_preprocess.R")
print("start loading libs")

library("dplyr")
library("jsonlite")

script_options <- fromJSON("config/deseq2.json")
file_paths <- script_options$files
filetype_to_filename <- script_options$filetype_to_filename

# get the filename of the count file
counts_filename <- filetype_to_filename[["counts"]]
info_filename <- filetype_to_filename[["info"]]

counts_filepath <- file_paths[grep(counts_filename, file_paths)]
info_filepath <- file_paths[grep(info_filename, file_paths)]
print(paste0("counts_filepath: ", counts_filepath))
print(paste0("info_filepath: ", info_filepath))

counts_tbl <- read.csv(
  counts_filepath, 
  sep=" "
)

print("got counts file")

info_tbl <- read.csv(
  info_filepath, 
  sep=" "
)

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

counts_df <- counts_tbl
rownames(counts_df) <- counts_df$gene_name
counts_df$gene_name <- NULL

# round numeric columns in the counts_df
is.num <- sapply(counts_df, is.numeric)
counts_df[is.num] <- lapply(counts_df[is.num], round)

new_colnames <- unlist(strsplit(colnames(info_tbl)[1], "[.]"))
info_df <- tidyr::separate(
  data = info_tbl,
  col = colnames(info_tbl)[1],
  sep = " ",
  into = new_colnames,
  remove = TRUE
)
info_df <- info_tbl

rownames(info_df) <- info_df$sample
info_df$sample <- NULL

print("colnames(info_df)")
print(colnames(info_df))

# Scale/factor variables
info_df$Age <- scale(info_df$Age, center = TRUE, scale = TRUE)
info_df$Gender <- as.factor(info_df$Gender)
info_df$Group <- as.factor(info_df$Group)

# verify factor levels
print("levels(info_df$Gender)")
print(levels(info_df$Gender))

print("levels(info_df$Group)")
print(levels(info_df$Group))

saveRDS(counts_df, "out/rds/deseq2_obj1.rds")
saveRDS(info_df, "out/rds/deseq2_obj2.rds")