print("---R-logs---")
print("start get_genes.R")
print("start loading libs")
libs <- c("glue", "tidyverse")
for (lib in libs) {
  print(lib)
  suppressPackageStartupMessages(library(lib, character.only = TRUE))
}
print("libs loaded")

in_dir <- "in/"
out_dir <- "out/tmp"

files <- Sys.glob(file.path(in_dir, "*results.txt"))
for (i in files) {
  name_f <- basename(i)
  print(name_f)

  df <- read_delim(i, delim = " ")

  # filtering the genes that pass two filters: pvalue adj < 0.05 and |log2FC| > log2(1.5)
  # In case of deseq2 results, these filters are summarized in the column filter, the ones that pass being filter=1.
  # Here the column header pvalue is the one used for the filter column
  df_filtered <- filter(df, pvalue == 1)

  df_filtered %>%
    separate(
      baseMean, ",",
      into = c("ID", "gene_name", "the_rest"),
      remove = TRUE
    ) %>%
    pull(ID) %>%
    str_remove("[.][^.]*$") %>%
    writeLines(glue("{out_dir}/{name_f}_genes.txt"))
}
