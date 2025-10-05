print("---R-logs---")
print("start get_genes.R")
print("start loading libs")
libs <- c("glue", "dplyr", "stringr")
for (lib in libs) {
  print(lib)
  suppressPackageStartupMessages(library(lib, character.only = TRUE))
}
library("tidyr")
print("libs loaded")

in_dir <- "in/"
out_dir <- "out/tmp"

files <- Sys.glob(file.path(in_dir, "*results.txt"))
for (i in files) {
  name_f <- basename(i)
  print(name_f)

  # df <- readr::read_delim(i, delim = " ")
  df <- read.csv(i, sep = " ")
  print("colnames:")
  print(colnames(df))

  # get all values in the column "filter"
  print("Values in the column 'filter':")
  print(unique(df$filter))

  # filtering the genes that pass two filters: pvalue adj < 0.05 and |log2FC| > log2(1.5)
  # In case of deseq2 results, these filters are summarized in the column filter, the ones that pass being filter=1.
  # Here the column header pvalue is the one used for the filter column
  df_filtered <- dplyr::filter(df, filter == 1)
  print(paste("Number of genes after filtering:", nrow(df_filtered)))

  print ("First 5 rows of the filtered dataframe:")
  print(head(df_filtered, 5))

  print("Writing genes to file...")
  writeLines(rownames(df_filtered), glue("{out_dir}/{name_f}_genes.txt"))

# below is for the datasets of Anna Esteve, which have a different format
#   df_filtered %>%
#     separate(
#       baseMean, ",",
#       into = c("ID", "gene_name", "the_rest"),
#       remove = TRUE
#     ) %>%
#     pull(ID) %>%
#     str_remove("[.][^.]*$") %>%
#     writeLines(glue("{out_dir}/{name_f}_genes.txt"))
}

# write a file to indicate that the script finished correctly
file.create(glue("{out_dir}/get_genes_finished.txt"))