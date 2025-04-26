#! /usr/bin/env Rscript
print("---R-logs---")
print("start fgsea.R")
print("start loading libs")
libs <- c(
  "fgsea", "data.table", "glue",
  "dplyr", "tibble", "BiocParallel", "jsonlite"
)
for (lib in libs) {
  print(lib)
  suppressPackageStartupMessages(library(lib, character.only = TRUE))
}
print("libs loaded")
### Parse args

# args = commandArgs(trailingOnly=TRUE)
# usage <- function(){
#   cat("
# The R Script

# Arguments:
# --input=file    - Pattern file name [mandatory]
# --outdir=path   - Path to output_dir [default: ./]
# --gmt=file      - Path to gmt file [mandatory]
# --split=char    - String to split name (first column) [default: \"\\.\"]
# --rank=int      - Column to rank [mandatory]
# --help          - print this text

# Example:
# ./fgsea.R --input=pattern \\
#           --ouputdir=\"path/to/output\" \\
#           --gmt=\"path/to/file.gmt\" \\
#           --split=\".\" \\
#           --rank=4\n\n")

#   q(save="no")
# }

## Default setting when no arguments passed
# if(length(args) < 1 || args == "--help") {
#   usage()
# }


## Parse arguments (we expect the form --arg=value)
# parseArgs <- function(x) strsplit(sub("^--", "", x), "=")
# argsDF <- as.data.frame(do.call("rbind", parseArgs(args)))
# opt <- as.list(as.character(argsDF$V2))
# names(opt) <- argsDF$V1



# if(is.null(opt$input)){
#   cat("ERROR: --input is a mandatory fields")
#   usage()
# }
# if(is.null(opt$outdir)){
#   opt$outdir<-"./"
# }

# if(is.null(opt$gmt)){
#     cat("ERROR: --gmt is a mandatory fields")
#     usage()
# }

# if(is.null(opt$split)){
#   opt$split<-"\\."
# }else{
#     if (opt$split=="."){
#         opt$split<-"\\."
#     }
# }

# if(is.null(opt$rank)){
#     cat("ERROR: --rank is a mandatory fields")
#     usage()
# }

# print(opt)
# working number of cores=20

# TODO
# number of cores should not be hardcoded
register(MulticoreParam(4))
# register(MulticoreParam(20))
print(bpparam())

### FUNCTIONS
run_fgsea <- function(fx, sepName, rankINT, allLevels) {
  bname <- tools::file_path_sans_ext(basename(fx))
  raw_table <- read.table(fx, sep = " ", header = T)
  rankName <- colnames(raw_table)[rankINT]
  print(paste("Ranking by: ", rankName, sep = ""))
  ranks <- data.frame(list(
    ID = sapply(
      strsplit(
        rownames(raw_table),
        sepName
      ),
      function(x) unlist(x)[1]
    ),
    shrunkenlfc = raw_table[, rankINT]
  ))
  ranks <- unique(ranks)
  ranks <- setNames(ranks$shrunkenlfc, ranks$ID)
  ranks <- ranks[!is.na(ranks)]
  fgseaRes <- fgsea(allLevels, ranks, nperm = 1000000, maxSize = 500)
  # pdf(paste(bname,"_fgsea.pdf", sep=""), width = 15, height = 10)
  pdf(glue("out/results/{bname}_fgsea.pdf"), width = 15, height = 10)
  topPathwaysUp <- fgseaRes[ES > 0][head(order(padj), n = 20), pathway]
  topPathwaysDown <- fgseaRes[ES < 0][head(order(padj), n = 20), pathway]
  topPathways <- c(topPathwaysUp, rev(topPathwaysDown))
  plotGseaTable(allLevels[topPathways], ranks, fgseaRes,
    gseaParam = 0.5, colwidths = c(5, 3, 0.8, 1.2, 1.2)
  )
  dev.off()
  fwrite(fgseaRes[padj < 0.05][order(padj, NES)],
    # file = paste(bname,"_fgsea.tsv", sep = ""),
    file = glue("out/results/{bname}_fgsea.tsv"),
    sep = "\t",
    sep2 = c("", " ", "")
  )
}


### MAIN
in_dir <- "in/"
out_dir <- "out/results"

files <- Sys.glob(file.path(in_dir, "*results.txt"))

# read in json passed from omicsdm_server
script_options <- fromJSON("analysis_options.json")
print(script_options)

reactome_identifier_mapping_file <- script_options$use_reactome_identifier_mapping_file
print(reactome_identifier_mapping_file)

if (is.null(reactome_identifier_mapping_file)) {
  file_paths <- script_options$file_paths
  gmt_filename <- file_paths[grep(".gmt", file_paths)]
  print(gmt_filename)

  splitted <- strsplit(gmt_filename, "/")[[1]]
  target_string <- splitted[length(splitted)]
  gmt_filename <- sub("_uploadedVersion_1.gmt", "", target_string) # Removing the unwanted part

  print("gmt_filename")
  print(gmt_filename)

  gmt_filepath <- paste0("out/tmp/", gmt_filename)
  print("gmt_filepath")
  print(gmt_filepath)
  allLevels <- gmtPathways(gmt_filepath)
  print("allLevels")
  print(allLevels)
  print("all levels loaded")
} else {
  allLevels <- gmtPathways("out/tmp/reactome_gmt.tsv")
}

print("HERE")
print("files")
print(files)

for (i in files) {
  print(paste("Analysing :", i), sep = "")
  run_fgsea(i, "\\.", as.integer(5), allLevels)
}

sink(format(
  Sys.time(),
  glue("{out_dir}/sessionInfo/sessionInfo.txt")
))
print(devtools::session_info())
sink()

platform_df <- devtools::session_info()$platform %>%
  unlist(.) %>%
  as.data.frame(.) %>%
  rownames_to_column()

packages_df <- devtools::session_info()$packages %>%
  as.data.frame(.) %>%
  filter(attached == TRUE) %>%
  dplyr::select(loadedversion, date, source) %>%
  rownames_to_column()

saveRDS(platform_df, "out/results/sessionInfo/platform.rds")
saveRDS(packages_df, "out/results/sessionInfo/packages.rds")
