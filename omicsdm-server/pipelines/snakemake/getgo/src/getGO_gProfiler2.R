#! /usr/bin/env Rscript
print("---R-logs---")
print("start getGO_gProfiler.R")
print("start loading libs")
libs <- c("glue", "dplyr", "tibble", "gprofiler2")
for (lib in libs) {
  print(lib)
  suppressPackageStartupMessages(library(lib, character.only = TRUE))
}
print("libs loaded")

# args <- commandArgs(TRUE)
# ## Help section
# usage <- function(){
#   cat("
#         The R Script

#         Arguments:
#         --input=file          - Pattern file name [mandatory]
#         --outdir=path         - Path to output_dir [default: ./]
#         --species=specie      - Specie name ex: hsapiens [default: hsapiens]
#         --baseurl=baseurl     - You'll find which is the best for you https://biit.cs.ut.ee/gprofiler/archives/ [default: https://biit.cs.ut.ee/gprofiler ]
#         --help                - print this text

#         Example:
#         ./GetGO_gProfiler2.R --input=pattern --ouputdir=\"path/to/output\" --species=specie \n\n")

#   q(save="no")
# }

# #args <- c("--input=/tmp/TEST_GENS/*genes","--baseurl=http://biit.cs.ut.ee/gprofiler_archive/r1185_e69_eg16/web")
# ## Default setting when no arguments passed
# if(length(args) < 1 || args == "--help") {
#   usage()
# }


# ## Parse arguments (we expect the form --arg=value)
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

# if(is.null(opt$species)){
#   opt$species<-"hsapiens"
# }

# if(is.null(opt$baseurl)){
#   opt$baseurl<-"https://biit.cs.ut.ee/gprofiler"
# }
# print(opt)

# set_base_url("https://3tr.cnag.crg.dev/gprofiler")

colsExport <- c(
  "query",
  "significant",
  "p_value",
  "term_size",
  "query_size",
  "intersection_size",
  "precision",
  "recall",
  "term_id",
  "source",
  "term_name",
  #  "parents",
  "intersection"
)

tmp_dir <- "out/tmp"
out_dir <- "out/results"

files <- Sys.glob(file.path(tmp_dir, "*genes.txt"))
for (i in files) {
  print(i)
  if (as.numeric(unlist(strsplit(system(paste("wc -l ", i, sep = ""), intern = TRUE), " "))[1]) > 0) {
    name_f <- basename(i)
    gene <- read.table(i, header = F)
    result <- gost(
      gene$V1,
      organism = "hsapiens",
      evcodes = TRUE
    )

    # result$result$parents <- lapply(result$result$parents, function(x) paste(x, collapse=","))
    write.table(
      result$result[, colsExport],
      glue("{out_dir}/{name_f}.table"),
      quote = FALSE, sep = "\t", row.names = F
    )
  }
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
