#!/usr/bin/env Rscript

# This is a wrapper script for the all pipeline
# It runs the original fgsea.R and then generates significant_genesets.gmt

# Source the original fgsea.R script
print("Running fgsea analysis...")
source("src/fgsea/fgsea.R")

# After fgsea completes, extract significant gene sets and create a GMT file
print("Creating significant gene sets GMT file...")

library(data.table)
library(dplyr)

# Find all fgsea results files
result_files <- Sys.glob("out/results/*_fgsea.tsv")

if (length(result_files) == 0) {
  stop("No FGSEA result files found")
}

# Combine all significant results
all_significant <- data.frame()
for (file in result_files) {
  res <- fread(file)
  # Filter for significant results (padj < 0.05)
  sig <- res[padj < 0.05]
  if (nrow(sig) > 0) {
    all_significant <- rbind(all_significant, sig)
  }
}

# Remove duplicates
all_significant <- unique(all_significant, by = "pathway")

# Create GMT file
gmt_file <- "out/results/fgsea/significant_genesets.gmt"
dir.create(dirname(gmt_file), recursive = TRUE, showWarnings = FALSE)

# Write GMT format: pathway_name \t description \t gene1 \t gene2 \t ...
write_gmt <- function(df, output_file) {
  con <- file(output_file, "w")
  for (i in 1:nrow(df)) {
    pathway_name <- df$pathway[i]
    # Use pathway name as description too
    description <- pathway_name
    # Get genes from the leadingEdge column (it's a list)
    genes <- unlist(df$leadingEdge[i])
    # Write in GMT format
    line <- paste(c(pathway_name, description, genes), collapse = "\t")
    writeLines(line, con)
  }
  close(con)
}

if (nrow(all_significant) > 0) {
  write_gmt(all_significant, gmt_file)
  print(paste("Created significant gene sets file with", nrow(all_significant), "pathways"))
} else {
  # Create empty file if no significant results
  file.create(gmt_file)
  print("No significant gene sets found, created empty GMT file")
}

print("FGSEA wrapper completed successfully")
