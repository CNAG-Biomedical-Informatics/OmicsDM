##### ARGPARSER
# args <- commandArgs(TRUE)
# args <- c("--counts=data/COUNTS_genes_TEST_134_135_summed",
#           "--config=data/config.R",
#           "--info=data/info_TEST_134_135",
#           "--group=GROUP",
#           "--control=TEST_134_500",
#           "--project=TEST_134_135",
#           "--onlypca=false")
## Default setting when no arguments passed

# Create R Environment from JSON File
print("---R-logs---")
print("start deseq2.R")
print("start loading libs")

library("jsonlite", character.only = TRUE)
library("stringr", character.only = TRUE)
library("glue", character.only = TRUE)
library("DESeq2", character.only = TRUE)
library("BiocParallel", character.only = TRUE)
library("pheatmap", character.only = TRUE)
library("RColorBrewer", character.only = TRUE)
library("ggplot2", character.only = TRUE)
library("genefilter", character.only = TRUE)
library("gridExtra", character.only = TRUE)
library("grid", character.only = TRUE)
library("methods", character.only = TRUE)
library("tibble", character.only = TRUE)
library("dplyr", character.only = TRUE)
library("openxlsx", character.only = TRUE)

libs <- c(
  "jsonlite", "stringr", "glue",
  "DESeq2", "BiocParallel", "pheatmap",
  "RColorBrewer", "ggplot2", "genefilter",
  "gridExtra", "grid", "methods", "tibble", "dplyr", "openxlsx"
)
for (lib in libs) {
  print(lib)
  suppressPackageStartupMessages(library(lib, character.only = TRUE))
}
print("libs loaded")

getEnv_fromJSON <- function(json) {
  cat("getEnv_fromJSON", json)

  regexp_num <- "(^(-|\\+)?((\\.?\\d+)|(\\d+\\.\\d+)|(\\d+\\.?))$)|(^(-|\\+)?((\\.?\\d+)|(\\d+\\.\\d+)|(\\d+\\.?))e(-|\\+)?(\\d+)$)"
  # regexp_int="(^(-|\\+)?\\d+$)|(^(-|\\+)?(\\d*)e(-|\\+)?(\\d+)$)"

  # Preconditions
  ## it must be a file
  if (!file.exists(json)) {
    print("ERROR - File does not exist!")
    stop("ERROR - File does not exist!")
  }

  ## test for json extension
  if (grepl("\\.json$", json) == FALSE) {
    print("ERROR - Must be a .json file!")
    stop("ERROR - Must be a .json file!")
  }

  # read the json
  cfg <- fromJSON(json)
  for (key in names(cfg)) {
    value <- cfg[[key]]
    if (length(value) > 1) {
      for (k in names(value)) {
        v <- str_split(value[k], ",")[[1]]

        # convert character vector to numeric if possible
        if (key != "contrast") {
          if (grepl(regexp_num, v)) {
            v <- as.numeric(v)
          }
        }
        cfg[[key]][[k]] <- v
      }
    }
    assign(key, cfg[[key]], envir = .GlobalEnv)
  }
  print("Placed variables in environment")
  message("Placed variables in environment")
}

getEnv_fromObj <- function(cfg) {
  regexp_num <- "(^(-|\\+)?((\\.?\\d+)|(\\d+\\.\\d+)|(\\d+\\.?))$)|(^(-|\\+)?((\\.?\\d+)|(\\d+\\.\\d+)|(\\d+\\.?))e(-|\\+)?(\\d+)$)"

  for (key in names(cfg)) {
    value <- cfg[[key]]
    if (length(value) > 1) {
      for (k in names(value)) {
        v <- str_split(value[k], ",")[[1]]

        # convert character vector to numeric if possible
        if (key != "contrast") {
          if (grepl(regexp_num, v)) {
            v <- as.numeric(v)
          }
        }
        cfg[[key]][[k]] <- v
      }
    }
    assign(key, cfg[[key]], envir = .GlobalEnv)
  }
  print("Placed variables in environment")
  message("Placed variables in environment")
}



# read in json passed from omicsdm_server
script_options <- fromJSON("analysis_options.json")
project <- paste("out/results/", script_options$project, sep = "")
control <- script_options$control
group <- script_options$group
onlypca <- as.logical(script_options$onlypca)
plot <- as.logical(script_options$plot)
covariants <- script_options$covariants
mod <- script_options$mod

print("script_options")
print(script_options)

cfg_obj <- list(
  contrast = script_options$contrast,
  plot_atr = script_options$plot_atr
)
print("cfg_obj")
print(cfg_obj)

getEnv_fromObj(cfg_obj)
# getEnv_fromJSON("config/deseq2_script_config.json")

## READ FILES ##
counts_raw <- readRDS("out/rds/deseq2_obj1.rds")
info_raw <- readRDS("out/rds/deseq2_obj2.rds")

# make sure that the counts are integer
cols <- names(counts_raw)[2:dim(counts_raw)[2]]
counts_raw[cols] <- lapply(counts_raw[cols], as.integer)

coldata <- subset(info_raw, row.names(info_raw) %in% colnames(counts_raw))
countdata <- counts_raw[, colnames(counts_raw) %in% rownames(coldata)]
coldata <- subset(coldata, row.names(coldata) %in% colnames(countdata))
names(coldata)[which(names(coldata) == group)] <- "group"

print("row.names(info_raw) %in% colnames(counts_raw)")
print(row.names(info_raw) %in% colnames(counts_raw))

print("colnames(counts_raw) %in% rownames(coldata)")
print(colnames(counts_raw) %in% rownames(coldata))

print("row.names(coldata) %in% colnames(countdata)")
print(row.names(coldata) %in% colnames(countdata))

print("coldata")
print(head(coldata))

print("names(coldata)")
print(names(head(coldata)))


# Adapt info
# source(config)
if (!is.null(covariants$factor)) {
  for (i in seq(length(names(covariants$factor)))) {
    coldata[, covariants$factor[[i]]] <- as.factor(coldata[, covariants$factor[[i]]])
  }
}

if (!is.null(covariants$continuous)) {
  for (i in seq(length(names(covariants$continuous)))) {
    levels_tmp <- paste(names(covariants$continuous)[i], seq(as.numeric(covariants$continuous[[i]][2])), sep = "")
    coldata[, covariants$continuous[[i]][1]] <- cut(coldata[, covariants$continuous[[i]][1]],
      as.numeric(covariants$continuous[[i]][2]),
      labels = levels_tmp
    )
  }
}

# Sort names countdata as rownames in coldata
countdata <- countdata[rownames(coldata)]

print("countdata")
print(head(countdata))

print("mod")
print(mod)

sink()

## BATCH EFFECT ##
dds <- DESeqDataSetFromMatrix(
  countData = countdata,
  colData = coldata,
  design = formula(eval(parse(text = mod)))
)

dds <- estimateSizeFactors(dds)
bc_per_group <- lapply(unique(coldata$group), function(x) rownames(coldata)[coldata$group == x])
all_members <- function(x) {
  if (length(x) > 1) {
    return(rowSums(counts(dds, normalized = TRUE)[, unlist(x)] >= 0) == length(unlist(x)))
  } else {
    return(counts(dds, normalized = TRUE)[, unlist(x)] >= 0)
  }
}
keep <- Reduce("|", lapply(bc_per_group, all_members))
# keep <- rowSums(counts(dds,normalized=TRUE) >= 10) >= min(rle(as.vector(coldata$group))$lengths)
dds <- dds[keep, ]

## RELEVEL CONTROL GROUP ##
dds[[group]] <- relevel(dds[["group"]], control)

## DIFFERENTIAL ANALYSIS ##

print("sessionInfo")
print(sessionInfo())
# onlypca <- FALSE
if (!onlypca) {
  # if (!args$onlypca){
  dds <- DESeq(dds, parallel = TRUE)
}

############## POLTS SENSE CONTRASTOS ############################################################
## rlog transformation and variance stabilization ##
# other normalization methods for plotting#

rld <- rlog(dds)
# vsd <-varianceStabilizingTransformation(dds)
rlogMat <- assay(rld)
# print (rlogMat)

write.table(rlogMat, file = paste(project, "_rlogMat.txt", sep = ""), quote = F)

# heatmap samples"
if ((plot)) {
  # if ((args$plot)){
  sampleDists <- dist(t(rlogMat))
  sampleDistMatrix <- as.matrix(sampleDists)
  # colnames(sampleDistMatrix) <- NULL
  colors <- colorRampPalette(rev(brewer.pal(9, "Blues")))(255)
  pdf(paste(project, "_sampletosample_heatmap.pdf", sep = ""), onefile = FALSE)
  # pdf(paste(args$project,"_sampletosample_heatmap.pdf",sep=""),onefile=FALSE)
  # annotation_heatmap = as.data.frame(sapply(plot_atr$heatmap_ann,function(x) eval(parse(text=x))), row.names = colnames(coldata))
  annotation_heatmap <- as.data.frame(colData(dds)[, plot_atr$heatmap_ann], row.names = row.names(colData(dds)))
  names(annotation_heatmap) <- plot_atr$heatmap_ann
  ## SAVED: annotation_col = as.data.frame(coldata[,plot_atr$heatmap_ann]
  pheatmap(sampleDistMatrix,
    clustering_distance_rows = sampleDists, clustering_distance_cols = sampleDists, col = colors,
    fontsize = 4, border_color = NA, annotation_col = annotation_heatmap, row.names = row.names(coldata)
  )
  dev.off()
  print("sample correlation heatmap done")
}

## PCA!!!
# Select

rv <- rowVars(assay(rld))
if (plot) {
  # if (args$plot){
  select <- order(rv, decreasing = TRUE)[seq_len(min(500, length(rv)))]
  pca <- prcomp(t(assay(rld)[select, ]))
  percentVar <- pca$sdev^2 / sum(pca$sdev^2)
  dims <- combn(c(1:4), 2)
  # dims <- combn(colnames(pca$x)[1:4],2)
  tmp_color <- coldata[, plot_atr$pca]
  if (length(plot_atr$pca) > 1) {
    color_factor <- factor(apply(tmp_color, 1, paste, collapse = " : "))
  } else {
    color_factor <- tmp_color
  }

  pdf(paste(project, "_pca.pdf", sep = ""))
  # pdf(paste(args$project,"_pca.pdf", sep=""))
  print(ggplot() +
    geom_text(aes_q(x = pca$x[, dims[1, 1]], y = pca$x[, dims[2, 1]], color = color_factor, label = as.factor(dds[["group"]]))) +
    xlab(paste(colnames(pca$x)[1], " (", round(percentVar[1] * 100, digits = 2), "%)", sep = "")) +
    ylab(paste(colnames(pca$x)[2], " (", round(percentVar[2] * 100, digits = 2), "%)", sep = "")) +
    theme(legend.title = element_blank()))


  grid_arrange_shared_legend <- function(plots) {
    #  plots <- list(...)
    g <- ggplotGrob(plots[[1]] + theme(legend.position = "bottom"))$grobs
    legend <- g[[which(sapply(g, function(x) x$name) == "guide-box")]]
    lheight <- sum(legend$height)
    grid.arrange(
      do.call(arrangeGrob, lapply(plots, function(x) {
        x + theme(legend.position = "none")
      })),
      legend,
      ncol = 1,
      heights = unit.c(unit(1, "npc") - lheight, lheight)
    )
  }

  toplot <- lapply(c(2:dim(dims)[2]), function(i) {
    ggplot() +
      geom_point(aes_q(x = pca$x[, dims[1, i]], y = pca$x[, dims[2, i]], color = color_factor)) +
      xlab(paste(colnames(pca$x)[dims[1, i]], " (", round(percentVar[dims[1, i]] * 100, digits = 2), "%)", sep = "")) +
      ylab(paste(colnames(pca$x)[dims[2, i]], " (", round(percentVar[dims[2, i]] * 100, digits = 2), "%)", sep = "")) +
      theme(legend.title = element_blank(), legend.position = "none")
  })

  # grid.arrange(grobs = toplot, nrow=3)
  grid_arrange_shared_legend(toplot)

  dims <- combn(c(5:ifelse(dim(pca$x)[2] < 8, dim(pca$x)[2], 8)), 2)
  toplot <- lapply(c(1:dim(dims)[2]), function(i) {
    ggplot() +
      geom_point(aes_q(x = pca$x[, dims[1, i]], y = pca$x[, dims[2, i]], color = color_factor)) +
      xlab(paste(colnames(pca$x)[dims[1, i]], " (", round(percentVar[dims[1, i]] * 100, digits = 2), "%)", sep = "")) +
      ylab(paste(colnames(pca$x)[dims[2, i]], " (", round(percentVar[dims[2, i]] * 100, digits = 2), "%)", sep = "")) +
      theme(legend.title = element_blank(), legend.position = "none")
  })


  # grid.arrange(grobs = toplot, nrow=3)
  grid_arrange_shared_legend(toplot)

  dev.off()

  write.table(sweep(abs(pca$rotation), 2, colSums(abs(pca$rotation)), "/"), paste(project, "_pc_contribution.txt", sep = ""),
    sep = "\t", quote = F, row.names = T, col.names = T
  )
  # write.table( sweep(abs(pca$rotation), 2, colSums(abs(pca$rotation)), "/"), paste(args$project,'_pc_contribution.txt', sep=""),
  #              sep = "\t", quote = F,row.names = T, col.names = T)
}

################## CONTRASTS FROM NOW ###############################################


## EXTRACT RESULTS ##
process_contrast <- function(title, contrastos) {
  print(glue("process {title}"))

  resAll <- results(dds, cooksCutoff = TRUE, contrast = contrastos, parallel = FALSE)
  res2 <- lfcShrink(dds, contrast = contrastos, res = resAll, type = "normal")
  res <- subset(res2, abs(log2FoldChange) > log2(1.5))
  resOrdered <- res[order(res$padj), ]
  resAllOrdered <- resAll[order(resAll$padj), ]

  ## EXTRACT COUNTS NORMALIZED ##
  c <- counts(dds, normalized = TRUE)
  c_ordered <- c[rownames(resAllOrdered), ]
  colnames(c_ordered) <- paste(dds[[contrastos[1]]], ",", colnames(c_ordered), sep = "")
  counts_dds <- (c_ordered[, order(colnames(c_ordered))])
  cc <- round(counts_dds, digits = 2)

  ## EXTRACT DESCRIPTION AND SUMMARY ##
  description_stats <- mcols(res)$description
  summary_stats <- summary(res)
  stats <- rbind(c(description_stats, summary_stats))
  sink(paste(project, "_", title, "_stats.txt", sep = ""))
  # sink(paste(args$project,'_',title,"_stats.txt",sep=""))
  mcols(res)$description
  summary(res)
  sink()

  ## WRITE TABLE RESULTS ##
  write.table(cc, paste(project, "_", title, "_norm_counts.txt", sep = ""), quote = FALSE)
  # write.table(cc, paste(args$project,"_",title,"_norm_counts.txt",sep=""),quote=FALSE)
  pass_filter <- as.numeric(as.numeric(rownames(resAllOrdered) %in% rownames(resOrdered)) & (resAllOrdered$padj < 0.05))

  df_all <- as.data.frame(resAllOrdered)
  df_all["filter"] <- pass_filter
  df_all["shrunkenlfc"] <- res2[rownames(df_all), "log2FoldChange"]
  df_all <- df_all[, c("baseMean", "log2FoldChange", "shrunkenlfc", "lfcSE", "stat", "filter", "pvalue", "padj")]
  write.table(df_all, paste(project, "_", title, "_results.txt", sep = ""), quote = FALSE)
  write.xlsx(df_all, paste(project, "_", title, "_results.xlsx", sep = ""), row.names = TRUE, colWidths = rep("auto", 9))

  # write.table(df_all,paste(args$project,"_", title,"_results.txt",sep=""),quote=FALSE)
  print("DE analysis finished")

  if ((plot) & (length(rownames(resOrdered)) >= plot_atr$de_genes_n)) {
    # if ((args$plot) & (length(rownames(resOrdered))>=plot_atr$de_genes_n)){
    select <- rlogMat[rownames(resOrdered), ][1:plot_atr$de_genes_n, ]
    data_subset <- subset(colData(dds), dds[[contrastos[1]]] %in% c(contrastos[3], contrastos[2]))
    select2 <- select[, row.names(data_subset)]

    df <- as.data.frame(data_subset[, plot_atr$heatmap_ann], row.names = row.names(data_subset))
    colnames(df) <- c(plot_atr$heatmap_ann)

    pdf(paste(project, "_", title, "_top", plot_atr$de_genes_n, "DEgenes_heatmap.pdf", sep = ""), onefile = FALSE)
    # pdf(paste(args$project,"_",title,"_top50DEgenes_heatmap.pdf",sep=""),onefile=FALSE)

    pheatmap(select2, fontsize_row = 6, show_rownames = TRUE, cluster_rows = TRUE, cluster_cols = TRUE, annotation_col = df, scale = "row", fontsize = 4, show_colnames = FALSE)
    dev.off()
    print(glue("top {plot_atr$de_genes_n} DE genes heatmap done"))
  }
}

if (!onlypca) {
  # if (!args$onlypca){
  print("process contrasts")
  print(names(contrast))
  sapply(names(contrast), function(x) process_contrast(x, contrast[[x]]))
}

sink(format(
  Sys.time(),
  glue("out/results/sessionInfo/sessionInfo.txt")
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
